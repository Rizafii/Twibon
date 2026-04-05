<?php

namespace App\Http\Controllers;

use App\Models\Twibone;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class CreatorController extends Controller
{
    public function show(Request $request, User $user): Response
    {
        $sort = (string) $request->string('sort', 'latest');

        if (!in_array($sort, ['latest', 'popular'], true)) {
            $sort = 'latest';
        }

        $statsTwibbons = Twibone::query()
            ->where('users_uid', $user->id)
            ->where('is_approved', true)
            ->withCount('usages')
            ->get();

        $twibbons = Twibone::query()
            ->where('users_uid', $user->id)
            ->where('is_approved', true)
            ->withCount('usages')
            ->when($sort === 'popular', function ($query): void {
                $query->orderByDesc('usages_count')->latest();
            })
            ->when($sort === 'latest', function ($query): void {
                $query->latest();
            })
            ->paginate(12)
            ->withQueryString()
            ->through(function (Twibone $twibone): array {
                return [
                    'id' => $twibone->id,
                    'name' => $twibone->name,
                    'description' => $twibone->description,
                    'slug' => $twibone->url,
                    'preview_url' => asset('storage/' . ltrim($twibone->path, '/')),
                    'created_at' => $twibone->created_at?->toIso8601String(),
                    'uses_count' => $twibone->usages_count,
                ];
            });

        $profilePhotoUrl = $user->profile_photo_path
            ? asset('storage/' . ltrim((string) $user->profile_photo_path, '/'))
            : null;

        $bannerPhotoUrl = $user->banner_photo_path
            ? asset('storage/' . ltrim((string) $user->banner_photo_path, '/'))
            : null;

        return Inertia::render('creator/show', [
            'canRegister' => Features::enabled(Features::registration()),
            'filters' => [
                'sort' => $sort,
            ],
            'creator' => [
                'id' => $user->id,
                'name' => $user->name,
                'bio' => $user->bio,
                'verified' => (bool) $user->verified,
                'profile_photo_url' => $profilePhotoUrl,
                'banner_photo_url' => $bannerPhotoUrl,
                'joined_at' => $user->created_at?->toIso8601String(),
                'stats' => [
                    'total_twibbons' => (int) $statsTwibbons->count(),
                    'total_uses' => (int) $statsTwibbons->sum('usages_count'),
                ],
            ],
            'twibbons' => $twibbons,
        ]);
    }
}
