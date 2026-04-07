<?php

namespace App\Http\Controllers;

use App\Models\ShortLink;
use App\Support\PublicPath;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MyProfileShortLinkController extends Controller
{
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $this->validatePayload($request);

        $shortLink = ShortLink::query()->create([
            'users_uid' => $request->user()->id,
            'label' => $validated['label'] !== '' ? $validated['label'] : null,
            'slug' => PublicPath::normalize($validated['slug']) ?? $validated['slug'],
            'target_url' => $validated['target_url'],
            'is_private' => true,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Shortlink berhasil dibuat.',
                'short_link' => [
                    'id' => $shortLink->id,
                    'label' => $shortLink->label,
                    'slug' => $shortLink->slug,
                    'target_url' => $shortLink->target_url,
                    'is_active' => $shortLink->is_active,
                    'public_url' => url('/' . $shortLink->slug),
                    'public_display_url' => PublicPath::displayUrl($shortLink->slug),
                ],
            ], 201);
        }

        return to_route('my-profile.show', ['tab' => 'url'])
            ->with('success', 'Shortlink berhasil dibuat.');
    }

    public function update(Request $request, ShortLink $shortLink): RedirectResponse
    {
        $this->ensureOwner($request, $shortLink);

        $validated = $this->validatePayload($request, $shortLink);

        $shortLink->update([
            'label' => $validated['label'] !== '' ? $validated['label'] : null,
            'slug' => PublicPath::normalize($validated['slug']) ?? $validated['slug'],
            'target_url' => $validated['target_url'],
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return to_route('my-profile.show', ['tab' => 'url'])
            ->with('success', 'Shortlink berhasil diperbarui.');
    }

    public function destroy(Request $request, ShortLink $shortLink): RedirectResponse
    {
        $this->ensureOwner($request, $shortLink);

        $shortLink->delete();

        return to_route('my-profile.show', ['tab' => 'url'])
            ->with('success', 'Shortlink berhasil dihapus.');
    }

    /**
     * @return array{label: string, slug: string, target_url: string, is_active?: bool}
     */
    private function validatePayload(Request $request, ?ShortLink $shortLink = null): array
    {
        $request->merge([
            'label' => trim((string) $request->input('label', '')),
            'slug' => PublicPath::normalize((string) $request->input('slug')),
            'target_url' => trim((string) $request->input('target_url', '')),
        ]);

        return $request->validate([
            'label' => ['nullable', 'string', 'max:80'],
            'slug' => [
                'required',
                'string',
                'min:3',
                'max:60',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                function (string $attribute, mixed $value, Closure $fail) use ($shortLink): void {
                    if (! is_string($value)) {
                        $fail('Slug tidak valid.');

                        return;
                    }

                    $normalized = PublicPath::normalize($value);

                    if ($normalized === null) {
                        $fail('Slug tidak valid.');

                        return;
                    }

                    if (! PublicPath::isAvailable($normalized, null, $shortLink?->id)) {
                        $fail('Slug sudah dipakai atau termasuk rute sistem.');
                    }
                },
            ],
            'target_url' => [
                'required',
                'string',
                'max:2048',
                'url',
                'regex:/^https?:\/\//i',
            ],
            'is_active' => ['sometimes', 'boolean'],
        ], [
            'slug.regex' => 'Slug hanya boleh huruf kecil, angka, dan tanda minus.',
            'target_url.regex' => 'URL tujuan harus diawali dengan http:// atau https://.',
        ]);
    }

    private function ensureOwner(Request $request, ShortLink $shortLink): void
    {
        abort_if($request->user()->id !== $shortLink->users_uid, 403);
    }
}
