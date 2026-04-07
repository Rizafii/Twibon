<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Twibone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TwibbonApprovalController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        $twibbons = Twibone::query()
            ->with('creator:id,name')
            ->withCount('usages')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(function (Twibone $twibone): array {
                return [
                    'id' => $twibone->id,
                    'name' => $twibone->name,
                    'slug' => $twibone->url,
                    'description' => $twibone->description,
                    'preview_url' => asset('storage/' . ltrim($twibone->path, '/')),
                    'custom_url' => $twibone->custom_url,
                    'creator_name' => $twibone->creator?->name ?? 'Unknown',
                    'is_approved' => $twibone->is_approved,
                    'uses_count' => $twibone->usages_count,
                    'created_at' => $twibone->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('admin/twibbon/index', [
            'filters' => [
                'search' => $search,
            ],
            'twibbons' => $twibbons,
        ]);
    }

    public function approve(Twibone $twibone): RedirectResponse
    {
        $twibone->update([
            'is_approved' => true,
        ]);

        return back()->with('success', 'Twibbon approved successfully.');
    }

    public function reject(Twibone $twibone): RedirectResponse
    {
        if ($twibone->path !== '') {
            Storage::disk('public')->delete($twibone->path);
        }

        $twibone->delete();

        return back()->with('success', 'Twibbon rejected and removed.');
    }
}
