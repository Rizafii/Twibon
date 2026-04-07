<?php

namespace App\Http\Controllers;

use App\Models\Twibone;
use App\Support\PublicPath;
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
            'custom_url' => [
                'nullable',
                'string',
                'min:3',
                'max:60',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! is_string($value) || trim($value) === '') {
                        return;
                    }

                    $normalized = PublicPath::normalize($value);

                    if ($normalized === null) {
                        $fail('Custom URL tidak valid.');

                        return;
                    }

                    if (! PublicPath::isAvailable($normalized)) {
                        $fail('Custom URL sudah dipakai atau termasuk rute sistem.');
                    }
                },
            ],
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
            'custom_url.regex' => 'Custom URL hanya boleh huruf kecil, angka, dan tanda minus.',
        ]);

        $customUrl = PublicPath::normalize((string) ($validated['custom_url'] ?? ''));

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
            'custom_url' => $customUrl,
            'path' => $framePath,
            'url' => $slug,
            'users_uid' => $request->user()->id,
            'is_approved' => false,
        ]);

        return back()->with('success', 'Menunggu approval admin');
    }
}
