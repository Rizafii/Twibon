<?php

namespace App\Http\Controllers;

use App\Models\Twibone;
use App\Support\PublicPath;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class TwibbonController extends Controller
{
    public function home(): Response
    {
        $approvedTwibbons = Twibone::query()
            ->with('creator:id,name,username,bio,profile_photo_path,verified')
            ->withCount('usages')
            ->where('is_approved', true)
            ->get();

        $trendingTwibbons = $approvedTwibbons
            ->sortByDesc('usages_count')
            ->take(10)
            ->values()
            ->map(function (Twibone $twibone): array {
                $publicPath = $twibone->custom_url
                    ? '/' . $twibone->custom_url
                    : '/twibbon/' . $twibone->url;

                $creatorProfilePhotoUrl = $twibone->creator?->profile_photo_path
                    ? asset('storage/' . ltrim((string) $twibone->creator->profile_photo_path, '/'))
                    : null;

                return [
                    'id' => $twibone->id,
                    'name' => $twibone->name,
                    'slug' => $twibone->url,
                    'custom_url' => $twibone->custom_url,
                    'public_path' => $publicPath,
                    'public_display_url' => PublicPath::displayUrl(ltrim($publicPath, '/')),
                    'preview_url' => asset('storage/' . ltrim($twibone->path, '/')),
                    'creator_id' => $twibone->creator?->id,
                    'creator_username' => $twibone->creator?->username,
                    'creator_name' => $twibone->creator?->name ?? 'Unknown',
                    'creator_profile_photo_url' => $creatorProfilePhotoUrl,
                    'creator_verified' => (bool) ($twibone->creator?->verified ?? false),
                    'uses_count' => $twibone->usages_count,
                ];
            });

        $risingCreators = $approvedTwibbons
            ->filter(fn(Twibone $twibone): bool => $twibone->creator !== null)
            ->groupBy('users_uid')
            ->map(function ($creatorTwibbons): array {
                /** @var Twibone $firstTwibbon */
                $firstTwibbon = $creatorTwibbons->first();
                $topTwibbon = $creatorTwibbons->sortByDesc('usages_count')->first();

                $profilePhotoUrl = $firstTwibbon->creator?->profile_photo_path
                    ? asset('storage/' . ltrim((string) $firstTwibbon->creator->profile_photo_path, '/'))
                    : null;

                return [
                    'id' => $firstTwibbon->creator?->id,
                    'username' => $firstTwibbon->creator?->username,
                    'name' => $firstTwibbon->creator?->name ?? 'Unknown',
                    'bio' => $firstTwibbon->creator?->bio,
                    'profile_photo_url' => $profilePhotoUrl,
                    'verified' => (bool) ($firstTwibbon->creator?->verified ?? false),
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
            ->with('creator:id,name,username,verified')
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
                $publicPath = $twibone->custom_url
                    ? '/' . $twibone->custom_url
                    : '/twibbon/' . $twibone->url;

                return [
                    'id' => $twibone->id,
                    'name' => $twibone->name,
                    'description' => $twibone->description,
                    'created_at' => $twibone->created_at?->toIso8601String(),
                    'slug' => $twibone->url,
                    'custom_url' => $twibone->custom_url,
                    'public_path' => $publicPath,
                    'public_display_url' => PublicPath::displayUrl(ltrim($publicPath, '/')),
                    'preview_url' => asset('storage/' . ltrim($twibone->path, '/')),
                    'creator_id' => $twibone->creator?->id,
                    'creator_username' => $twibone->creator?->username,
                    'creator_name' => $twibone->creator?->name ?? 'Unknown',
                    'creator_verified' => (bool) ($twibone->creator?->verified ?? false),
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
        $twibbon = $this->findApprovedTwibbonBy('url', $slug);

        return $this->renderShowPage($twibbon);
    }

    public function showByCustomPath(string $customPath): Response
    {
        $twibbon = $this->findApprovedTwibbonBy('custom_url', $customPath);

        return $this->renderShowPage($twibbon);
    }

    private function findApprovedTwibbonBy(string $column, string $value): Twibone
    {
        return Twibone::query()
            ->with('creator:id,name,username,bio,profile_photo_path,banner_photo_path,verified')
            ->withCount('usages')
            ->where('is_approved', true)
            ->where($column, $value)
            ->firstOrFail();
    }

    private function renderShowPage(Twibone $twibbon): Response
    {
        $publicPath = $twibbon->custom_url
            ? '/' . $twibbon->custom_url
            : '/twibbon/' . $twibbon->url;

        $creatorProfilePhotoUrl = $twibbon->creator?->profile_photo_path
            ? asset('storage/' . ltrim((string) $twibbon->creator->profile_photo_path, '/'))
            : null;

        $creatorBannerPhotoUrl = $twibbon->creator?->banner_photo_path
            ? asset('storage/' . ltrim((string) $twibbon->creator->banner_photo_path, '/'))
            : null;

        return Inertia::render('twibbon/show', [
            'twibbon' => [
                'id' => $twibbon->id,
                'name' => $twibbon->name,
                'description' => $twibbon->description,
                'created_at' => $twibbon->created_at?->toIso8601String(),
                'slug' => $twibbon->url,
                'custom_url' => $twibbon->custom_url,
                'public_path' => $publicPath,
                'public_display_url' => PublicPath::displayUrl(ltrim($publicPath, '/')),
                'preview_url' => asset('storage/' . ltrim($twibbon->path, '/')),
                'creator_name' => $twibbon->creator?->name ?? 'Unknown',
                'creator' => [
                    'id' => $twibbon->creator?->id,
                    'username' => $twibbon->creator?->username,
                    'name' => $twibbon->creator?->name ?? 'Unknown',
                    'bio' => $twibbon->creator?->bio,
                    'profile_photo_url' => $creatorProfilePhotoUrl,
                    'banner_photo_url' => $creatorBannerPhotoUrl,
                    'verified' => (bool) ($twibbon->creator?->verified ?? false),
                ],
                'uses_count' => $twibbon->usages_count,
            ],
        ]);
    }
}
