<?php

namespace App\Http\Controllers;

use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Twibone;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MyProfileController extends Controller
{
    public function show(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = (string) $request->string('status', 'all');

        if (! in_array($status, ['all', 'approved', 'pending'], true)) {
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
                    'preview_url' => asset('storage/' . ltrim($twibone->path, '/')),
                    'is_approved' => $twibone->is_approved,
                    'uses_count' => $twibone->usages_count,
                    'uses_last_7_days_count' => $twibone->usages_last_7_days_count,
                    'links_count' => $twibone->links_count,
                    'link_clicks_count' => $twibone->link_clicks_count,
                    'created_at' => $twibone->created_at?->toDateTimeString(),
                ];
            });

        $user = $request->user();

        $profilePhotoUrl = $user->profile_photo_path
            ? asset('storage/' . ltrim((string) $user->profile_photo_path, '/'))
            : null;

        $bannerPhotoUrl = $user->banner_photo_path
            ? asset('storage/' . ltrim((string) $user->banner_photo_path, '/'))
            : null;

        return Inertia::render('profile/my', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'bio' => $user->bio,
                'verified' => (bool) $user->verified,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'profile_photo_url' => $profilePhotoUrl,
                'banner_photo_url' => $bannerPhotoUrl,
                'joined_at' => $user->created_at?->toIso8601String(),
            ],
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

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        unset($validated['profile_photo_path'], $validated['banner_photo_path']);

        $user->fill($validated);

        if ($request->hasFile('profile_photo_path')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }

            $user->profile_photo_path = $request->file('profile_photo_path')?->store('users/profile-photos', 'public');
        }

        if ($request->hasFile('banner_photo_path')) {
            if ($user->banner_photo_path) {
                Storage::disk('public')->delete($user->banner_photo_path);
            }

            $user->banner_photo_path = $request->file('banner_photo_path')?->store('users/banners', 'public');
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('my-profile.show')->with('success', 'Profil berhasil diperbarui.');
    }

    public function password(): Response
    {
        return Inertia::render('profile/password');
    }

    public function updatePassword(PasswordUpdateRequest $request): RedirectResponse
    {
        $request->user()->update([
            'password' => $request->password,
        ]);

        return back()->with('success', 'Password berhasil diperbarui.');
    }
}
