<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        $users = User::query()
            ->withCount('twibones')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($searchQuery) use ($search): void {
                    $searchQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(function (User $user): array {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => $user->is_admin,
                    'verified' => $user->verified,
                    'twibbons_count' => $user->twibones_count,
                    'created_at' => $user->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('admin/user/index', [
            'filters' => [
                'search' => $search,
            ],
            'users' => $users,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'is_admin' => ['required', 'boolean'],
            'verified' => ['required', 'boolean'],
        ]);

        if ((int) $request->user()->id === (int) $user->id && ! $validated['is_admin']) {
            return back()->with('error', 'Kamu tidak bisa melepas role admin akun sendiri.');
        }

        $user->update([
            'is_admin' => $validated['is_admin'],
            'verified' => $validated['verified'],
        ]);

        return back()->with('success', 'Data user berhasil diperbarui.');
    }
}
