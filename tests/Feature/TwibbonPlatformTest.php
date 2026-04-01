<?php

use App\Models\Twibone;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guest can open twibbon landing page', function () {
    $this->get(route('home'))
        ->assertOk();
});

test('guest can open editor and store usage for approved twibbon', function () {
    $user = User::factory()->create();

    $twibone = Twibone::query()->create([
        'name' => 'Public Campaign',
        'description' => 'Approved twibbon.',
        'path' => 'twibbons/frames/frame.png',
        'url' => 'public-campaign',
        'users_uid' => $user->id,
        'is_approved' => true,
    ]);

    $this->get("/editor/{$twibone->url}")
        ->assertOk();

    $this->postJson("/editor/{$twibone->url}/usage")
        ->assertOk();

    $this->assertDatabaseHas('twibone_used', [
        'twibone_uid' => $twibone->id,
    ]);
});

test('upload page requires authentication', function () {
    $this->get('/upload')
        ->assertRedirect(route('login'));
});

test('authenticated user can upload twibbon and it remains pending', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/upload', [
            'name' => 'Earth Day 2026',
            'description' => 'Twibbon for earth day campaign.',
            'frame' => UploadedFile::fake()->image('frame.png', 900, 1200),
        ])
        ->assertRedirect('/upload');

    $this->assertDatabaseHas('twibone', [
        'name' => 'Earth Day 2026',
        'users_uid' => $user->id,
        'is_approved' => false,
    ]);
});

test('upload rejects twibbon frame with non 3:4 ratio', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/upload', [
            'name' => 'Wrong Ratio Campaign',
            'description' => 'This should be rejected by ratio rule.',
            'frame' => UploadedFile::fake()->image('frame.png', 800, 800),
        ])
        ->assertSessionHasErrors('frame');

    $this->assertDatabaseMissing('twibone', [
        'name' => 'Wrong Ratio Campaign',
    ]);
});

test('non admin cannot access admin twibbon panel', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
    ->get('/dashboard/twibbon')
        ->assertForbidden();
});

test('admin can approve twibbon submission', function () {
    $admin = User::factory()->create([
        'is_admin' => true,
    ]);

    $creator = User::factory()->create();

    $twibone = Twibone::query()->create([
        'name' => 'School Event',
        'description' => 'School event twibbon.',
        'path' => 'twibbons/frames/school.png',
        'url' => 'school-event',
        'users_uid' => $creator->id,
        'is_approved' => false,
    ]);

    $this->actingAs($admin)
        ->patch("/dashboard/twibbon/{$twibone->id}/approve")
        ->assertRedirect();

    $this->assertDatabaseHas('twibone', [
        'id' => $twibone->id,
        'is_approved' => true,
    ]);
});
