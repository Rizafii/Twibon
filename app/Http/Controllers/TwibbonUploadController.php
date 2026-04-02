<?php

namespace App\Http\Controllers;

use App\Models\Twibone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class TwibbonUploadController extends Controller
{
    public function create(): RedirectResponse
    {
        return to_route('twibbon.catalog');
    }

    public function store(Request $request): RedirectResponse
    {
        $rateLimitKey = 'twibbon-upload:'.($request->user()?->id ?? $request->ip());

        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);

            return back()->withErrors([
                'frame' => "Terlalu banyak percobaan upload. Coba lagi dalam {$seconds} detik.",
            ]);
        }

        RateLimiter::hit($rateLimitKey, 60);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:1200'],
            'frame' => [
                'required',
                'file',
                'image',
                'mimes:png',
                'max:5120',
                'dimensions:ratio=3/4',
            ],
        ], [
            'frame.dimensions' => 'Format twibbon harus rasio 3:4.',
        ]);

        $baseSlug = Str::slug($validated['name']);
        $baseSlug = $baseSlug === '' ? 'twibbon' : $baseSlug;
        $slug = $baseSlug;
        $counter = 2;

        while (Twibone::query()->where('url', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $framePath = $request->file('frame')->store('twibbons/frames', 'public');

        Twibone::query()->create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'path' => $framePath,
            'url' => $slug,
            'users_uid' => $request->user()->id,
            'is_approved' => false,
        ]);

        return back()->with('success', 'Menunggu approval admin');
    }
}
