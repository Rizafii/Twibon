<?php

namespace App\Http\Controllers;

use App\Models\Twibone;
use App\Support\PublicPath;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TwibbonMineController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = (string) $request->string('status', 'all');

        if (!in_array($status, ['all', 'approved', 'pending'], true)) {
            $status = 'all';
        }

        $analyticsCounts = [
            'usages',
            'usages as usages_last_7_days_count' => function ($query): void {
                $query->where('created_at', '>=', now()->subDays(7));
            },
            'links',
            'linkClicks',
        ];

        $userTwibbons = Twibone::query()
            ->where('users_uid', $request->user()->id)
            ->withCount($analyticsCounts)
            ->get();

        $topTwibbon = $userTwibbons
            ->sortByDesc('usages_count')
            ->first();

        $twibbons = Twibone::query()
            ->where('users_uid', $request->user()->id)
            ->withCount($analyticsCounts)
            ->when($status === 'approved', function ($query): void {
                $query->where('is_approved', true);
            })
            ->when($status === 'pending', function ($query): void {
                $query->where('is_approved', false);
            })
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($searchQuery) use ($search): void {
                    $searchQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(9)
            ->withQueryString()
            ->through(function (Twibone $twibone): array {
                return [
                    'id' => $twibone->id,
                    'name' => $twibone->name,
                    'description' => $twibone->description,
                    'slug' => $twibone->url,
                    'preview_url' => asset('storage/'.ltrim($twibone->path, '/')),
                    'is_approved' => $twibone->is_approved,
                    'uses_count' => $twibone->usages_count,
                    'uses_last_7_days_count' => $twibone->usages_last_7_days_count,
                    'links_count' => $twibone->links_count,
                    'link_clicks_count' => $twibone->link_clicks_count,
                    'created_at' => $twibone->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('twibbon/my', [
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => [
                'total_twibbons' => $userTwibbons->count(),
                'approved_twibbons' => $userTwibbons->where('is_approved', true)->count(),
                'pending_twibbons' => $userTwibbons->where('is_approved', false)->count(),
                'total_uses' => (int) $userTwibbons->sum('usages_count'),
                'uses_last_7_days' => (int) $userTwibbons->sum('usages_last_7_days_count'),
                'total_links' => (int) $userTwibbons->sum('links_count'),
                'total_link_clicks' => (int) $userTwibbons->sum('link_clicks_count'),
                'top_twibbon' => $topTwibbon ? [
                    'name' => $topTwibbon->name,
                    'slug' => $topTwibbon->url,
                    'uses_count' => $topTwibbon->usages_count,
                ] : null,
            ],
            'twibbons' => $twibbons,
        ]);
    }

    public function edit(Request $request, Twibone $twibone): Response
    {
        $this->ensureOwner($request, $twibone);

        return Inertia::render('twibbon/edit', [
            'twibbon' => [
                'id' => $twibone->id,
                'name' => $twibone->name,
                'description' => $twibone->description,
                'slug' => $twibone->url,
                'custom_url' => $twibone->custom_url,
                'public_url' => $twibone->custom_url
                    ? url('/' . $twibone->custom_url)
                    : url('/twibbon/' . $twibone->url),
                'preview_url' => asset('storage/'.ltrim($twibone->path, '/')),
                'is_approved' => $twibone->is_approved,
            ],
        ]);
    }

    public function update(Request $request, Twibone $twibone): RedirectResponse
    {
        $this->ensureOwner($request, $twibone);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:1200'],
            'custom_url' => [
                'nullable',
                'string',
                'min:3',
                'max:60',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                function (string $attribute, mixed $value, \Closure $fail) use ($twibone): void {
                    if (! is_string($value) || trim($value) === '') {
                        return;
                    }

                    $normalized = PublicPath::normalize($value);

                    if ($normalized === null) {
                        $fail('Custom URL tidak valid.');

                        return;
                    }

                    if (! PublicPath::isAvailable($normalized, $twibone->id)) {
                        $fail('Custom URL sudah dipakai atau termasuk rute sistem.');
                    }
                },
            ],
        ]);

        $customUrl = PublicPath::normalize((string) ($validated['custom_url'] ?? ''));

        $baseSlug = Str::slug($validated['name']);
        $baseSlug = $baseSlug === '' ? 'twibbon' : $baseSlug;
        $slug = $baseSlug;
        $counter = 2;

        while (
            Twibone::query()
                ->where('url', $slug)
                ->whereKeyNot($twibone->id)
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $twibone->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'url' => $slug,
            'custom_url' => $customUrl,
        ]);

        return to_route('my-profile.show')->with('success', 'Twibbon berhasil diperbarui.');
    }

    public function destroy(Request $request, Twibone $twibone): RedirectResponse
    {
        $this->ensureOwner($request, $twibone);

        if ($twibone->path !== '') {
            Storage::disk('public')->delete($twibone->path);
        }

        $twibone->delete();

        return to_route('my-profile.show')->with('success', 'Twibbon berhasil dihapus.');
    }

    private function ensureOwner(Request $request, Twibone $twibone): void
    {
        abort_if($request->user()->id !== $twibone->users_uid, 403);
    }
}
