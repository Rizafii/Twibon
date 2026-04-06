<?php

use App\Http\Controllers\Admin\TwibbonApprovalController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\CreatorController;
use App\Http\Controllers\MyProfileController;
use App\Http\Controllers\TwibbonController;
use App\Http\Controllers\TwibbonEditorController;
use App\Http\Controllers\TwibbonMineController;
use App\Http\Controllers\TwibbonUploadController;
use Illuminate\Support\Facades\Route;

Route::get('/', [TwibbonController::class, 'home'])->name('home');
Route::get('/catalog', [TwibbonController::class, 'catalog'])->name('twibbon.catalog');
Route::get('/creator/{user:username}', [CreatorController::class, 'show'])->name('creator.show');
Route::get('/twibbon/{slug}', [TwibbonController::class, 'show'])->name('twibbon.show');
Route::get('/editor/{slug}', [TwibbonEditorController::class, 'show'])->name('twibbon.editor.show');
Route::post('/editor/{slug}/usage', [TwibbonEditorController::class, 'storeUsage'])->name('twibbon.editor.usage');

Route::middleware(['auth'])->group(function () {
    Route::get('/upload', [TwibbonUploadController::class, 'create'])->name('twibbon.upload.create');
    Route::post('/upload', [TwibbonUploadController::class, 'store'])->name('twibbon.upload.store');

    Route::get('/my-profile', [MyProfileController::class, 'show'])->name('my-profile.show');
    Route::patch('/my-profile', [MyProfileController::class, 'update'])->name('my-profile.update');
    Route::get('/my-profile/password', [MyProfileController::class, 'password'])->name('my-profile.password');
    Route::put('/my-profile/password', [MyProfileController::class, 'updatePassword'])
        ->middleware('throttle:6,1')
        ->name('my-profile.password.update');

    Route::redirect('/my-twibbon', '/my-profile')->name('twibbon.mine');
    Route::get('/my-profile/twibbon/{twibone}/edit', [TwibbonMineController::class, 'edit'])->name('my-profile.twibbon.edit');
    Route::patch('/my-profile/twibbon/{twibone}', [TwibbonMineController::class, 'update'])->name('my-profile.twibbon.update');
    Route::delete('/my-profile/twibbon/{twibone}', [TwibbonMineController::class, 'destroy'])->name('my-profile.twibbon.destroy');

    // Legacy routes kept for backward compatibility.
    Route::get('/my-twibbon/{twibone}/edit', [TwibbonMineController::class, 'edit'])->name('twibbon.mine.edit');
    Route::patch('/my-twibbon/{twibone}', [TwibbonMineController::class, 'update'])->name('twibbon.mine.update');
    Route::delete('/my-twibbon/{twibone}', [TwibbonMineController::class, 'destroy'])->name('twibbon.mine.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/dashboard/twibbon', [TwibbonApprovalController::class, 'index'])->name('admin.twibbon.index');
    Route::patch('/dashboard/twibbon/{twibone}/approve', [TwibbonApprovalController::class, 'approve'])->name('admin.twibbon.approve');
    Route::delete('/dashboard/twibbon/{twibone}', [TwibbonApprovalController::class, 'reject'])->name('admin.twibbon.reject');
    Route::get('/dashboard/users', [UserManagementController::class, 'index'])->name('admin.users.index');
    Route::patch('/dashboard/users/{user}', [UserManagementController::class, 'update'])->name('admin.users.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
