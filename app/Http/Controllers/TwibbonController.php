<?php

namespace App\Http\Controllers;

use App\Models\Twibone;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class TwibbonController extends Controller
{
    public function home(): Response
    {
        $approvedTwibbons = Twibone::query()
            ->with('creator:id,name,bio,profile_photo_path')
            ->withCount('usages')
            ->where('is_approved', true)
            ->get();

        $trendingTwibbons = $approvedTwibbons
            ->sortByDesc('usages_count')
            ->take(10)
            ->values()
            ->map(function (Twibone $twibone): array {
                return [
                    'id' => $twibone->id,
                    'name' => $twibone->name,
                    'slug' => $twibone->url,
                    'preview_url' => asset('storage/'.ltrim($twibone->path, '/')),
                    'creator_name' => $twibone->creator?->name ?? 'Unknown',
                    'uses_count' => $twibone->usages_count,
                ];
            });

        $risingCreators = $approvedTwibbons
            ->filter(fn (Twibone $twibone): bool => $twibone->creator !== null)
            ->groupBy('users_uid')
            ->map(function ($creatorTwibbons): array {
                /** @var Twibone $firstTwibbon */
                $firstTwibbon = $creatorTwibbons->first();
                $topTwibbon = $creatorTwibbons->sortByDesc('usages_count')->first();

                $profilePhotoUrl = $firstTwibbon->creator?->profile_photo_path
                    ? asset('storage/'.ltrim((string) $firstTwibbon->creator->profile_photo_path, '/'))
                    : null;

                return [
                    'name' => $firstTwibbon->creator?->name ?? 'Unknown',
                    'bio' => $firstTwibbon->creator?->bio,
                    'profile_photo_url' => $profilePhotoUrl,
                    'twibbon_count' => $creatorTwibbons->count(),
                    'total_uses' => $creatorTwibbons->sum('usages_count'),
                    'featured_twibbon_slug' => $topTwibbon?->url,
                ];
            })
            ->sortByDesc('total_uses')
            ->take(6)
            ->values();

        return Inertia::render('twibbon/home', [
            'canRegister' => Features::enabled(Features::registration()),
            'stats' => [
                'approved_twibbons' => $approvedTwibbons->count(),
            ],
            'trending_twibbons' => $trendingTwibbons,
            'rising_creators' => $risingCreators,
        ]);
    }

    public function catalog(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        $twibbons = Twibone::query()
            ->with('creator:id,name')
            ->withCount('usages')
            ->where('is_approved', true)
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($searchQuery) use ($search): void {
                    $searchQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(function (Twibone $twibone): array {
                return [
                    'id' => $twibone->id,
                    'name' => $twibone->name,
                    'description' => $twibone->description,
                    'created_at' => $twibone->created_at?->toIso8601String(),
                    'slug' => $twibone->url,
                    'preview_url' => asset('storage/'.ltrim($twibone->path, '/')),
                    'creator_name' => $twibone->creator?->name ?? 'Unknown',
                    'uses_count' => $twibone->usages_count,
                ];
            });

        return Inertia::render('twibbon/index', [
            'canRegister' => Features::enabled(Features::registration()),
            'filters' => [
                'search' => $search,
            ],
            'twibbons' => $twibbons,
        ]);
    }

    public function show(string $slug): Response
    {
        $twibbon = Twibone::query()
            ->with('creator:id,name,bio,profile_photo_path,banner_photo_path')
            ->withCount('usages')
            ->where('is_approved', true)
            ->where('url', $slug)
            ->firstOrFail();

        $creatorProfilePhotoUrl = $twibbon->creator?->profile_photo_path
            ? asset('storage/'.ltrim((string) $twibbon->creator->profile_photo_path, '/'))
            : null;

        $creatorBannerPhotoUrl = $twibbon->creator?->banner_photo_path
            ? asset('storage/'.ltrim((string) $twibbon->creator->banner_photo_path, '/'))
            : null;

        return Inertia::render('twibbon/show', [
            'twibbon' => [
                'id' => $twibbon->id,
                'name' => $twibbon->name,
                'description' => $twibbon->description,
                'created_at' => $twibbon->created_at?->toIso8601String(),
                'slug' => $twibbon->url,
                'preview_url' => asset('storage/'.ltrim($twibbon->path, '/')),
                'creator_name' => $twibbon->creator?->name ?? 'Unknown',
                'creator' => [
                    'name' => $twibbon->creator?->name ?? 'Unknown',
                    'bio' => $twibbon->creator?->bio,
                    'profile_photo_url' => $creatorProfilePhotoUrl,
                    'banner_photo_url' => $creatorBannerPhotoUrl,
                ],
                'uses_count' => $twibbon->usages_count,
            ],
        ]);
    }
}
