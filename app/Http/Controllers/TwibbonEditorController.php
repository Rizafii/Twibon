<?php

namespace App\Http\Controllers;

use App\Models\Twibone;
use App\Models\TwiboneUsed;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TwibbonEditorController extends Controller
{
    public function show(string $slug): Response
    {
        $twibbon = Twibone::query()
            ->where('is_approved', true)
            ->where('url', $slug)
            ->firstOrFail();

        return Inertia::render('twibbon/editor', [
            'twibbon' => [
                'id' => $twibbon->id,
                'name' => $twibbon->name,
                'slug' => $twibbon->url,
                'frame_url' => asset('storage/'.ltrim($twibbon->path, '/')),
            ],
        ]);
    }

    public function storeUsage(Request $request, string $slug): JsonResponse
    {
        $twibbon = Twibone::query()
            ->where('is_approved', true)
            ->where('url', $slug)
            ->firstOrFail();

        TwiboneUsed::query()->create([
            'twibone_uid' => $twibbon->id,
            'ip_address' => $request->ip(),
            'agent' => mb_substr((string) $request->userAgent(), 0, 1000),
        ]);

        return response()->json([
            'success' => true,
        ]);
    }
}
