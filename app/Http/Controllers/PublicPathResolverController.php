<?php

namespace App\Http\Controllers;

use App\Models\ShortLink;
use App\Models\Twibone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PublicPathResolverController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $path = trim($request->path(), '/');

        if ($path === '' || str_contains($path, '/')) {
            abort(404);
        }

        if (! preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $path)) {
            abort(404);
        }

        if (Twibone::query()->where('is_approved', true)->where('custom_url', $path)->exists()) {
            return app(TwibbonController::class)->showByCustomPath($path);
        }

        $shortLink = ShortLink::query()
            ->where('slug', $path)
            ->where('is_active', true)
            ->first();

        if ($shortLink === null) {
            abort(404);
        }

        $shortLink->clicks()->create([
            'ip_address' => $request->ip(),
            'agent' => mb_substr((string) $request->userAgent(), 0, 1000),
        ]);

        return redirect()->away($shortLink->target_url);
    }
}
