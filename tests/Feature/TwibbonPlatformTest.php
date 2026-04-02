<?php

use App\Models\Twibone;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

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

test('authenticated user visiting upload route is redirected to catalog', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/upload')
        ->assertRedirect('/catalog');
});

test('my twibbon page requires authentication', function () {
    $this->get('/my-twibbon')
        ->assertRedirect(route('login'));
});

test('authenticated user can view my twibbon analytics page', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $myTwibbon = Twibone::query()->create([
        'name' => 'My Event Twibbon',
        'description' => 'My own campaign twibbon.',
        'path' => 'twibbons/frames/mine.png',
        'url' => 'my-event-twibbon',
        'users_uid' => $user->id,
        'is_approved' => true,
    ]);

    Twibone::query()->create([
        'name' => 'Other User Twibbon',
        'description' => 'Should not appear in my list.',
        'path' => 'twibbons/frames/other.png',
        'url' => 'other-user-twibbon',
        'users_uid' => $otherUser->id,
        'is_approved' => true,
    ]);

    $this->actingAs($user)
        ->get('/my-twibbon')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('twibbon/my')
            ->where('stats.total_twibbons', 1)
            ->where('twibbons.data.0.slug', $myTwibbon->url),
        );
});

test('owner can open edit page and update own twibbon', function () {
    $user = User::factory()->create();

    $twibone = Twibone::query()->create([
        'name' => 'My Old Twibbon',
        'description' => 'Old description.',
        'path' => 'twibbons/frames/mine-old.png',
        'url' => 'my-old-twibbon',
        'users_uid' => $user->id,
        'is_approved' => false,
    ]);

    $this->actingAs($user)
        ->get("/my-twibbon/{$twibone->id}/edit")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('twibbon/edit')
            ->where('twibbon.id', $twibone->id),
        );

    $this->actingAs($user)
        ->patch("/my-twibbon/{$twibone->id}", [
            'name' => 'My Updated Twibbon',
            'description' => 'Updated description.',
        ])
        ->assertRedirect('/my-twibbon');

    $this->assertDatabaseHas('twibone', [
        'id' => $twibone->id,
        'name' => 'My Updated Twibbon',
        'description' => 'Updated description.',
        'url' => 'my-updated-twibbon',
    ]);
});

test('owner can delete own twibbon', function () {
    $user = User::factory()->create();

    $twibone = Twibone::query()->create([
        'name' => 'Delete Me',
        'description' => 'Delete description.',
        'path' => 'twibbons/frames/delete-me.png',
        'url' => 'delete-me',
        'users_uid' => $user->id,
        'is_approved' => false,
    ]);

    $this->actingAs($user)
        ->delete("/my-twibbon/{$twibone->id}")
        ->assertRedirect('/my-twibbon');

    $this->assertDatabaseMissing('twibone', [
        'id' => $twibone->id,
    ]);
});

test('user cannot edit other users twibbon', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $twibone = Twibone::query()->create([
        'name' => 'Not Yours',
        'description' => 'Not yours description.',
        'path' => 'twibbons/frames/not-yours.png',
        'url' => 'not-yours',
        'users_uid' => $otherUser->id,
        'is_approved' => false,
    ]);

    $this->actingAs($user)
        ->get("/my-twibbon/{$twibone->id}/edit")
        ->assertForbidden();
});

test('authenticated user can upload twibbon and it remains pending', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->from('/catalog')
        ->post('/upload', [
            'name' => 'Earth Day 2026',
            'description' => 'Twibbon for earth day campaign.',
            'frame' => UploadedFile::fake()->image('frame.png', 900, 1200),
        ])
        ->assertRedirect('/catalog');

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

test('upload is rate limited per user', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    foreach (range(1, 5) as $attempt) {
        $this->actingAs($user)
            ->from('/catalog')
            ->post('/upload', [
                'name' => "Campaign {$attempt}",
                'description' => "Upload attempt {$attempt}.",
                'frame' => UploadedFile::fake()->image("frame-{$attempt}.png", 900, 1200),
            ])
            ->assertRedirect('/catalog');
    }

    $this->actingAs($user)
        ->from('/catalog')
        ->post('/upload', [
            'name' => 'Campaign 6',
            'description' => 'This one should be blocked by rate limit.',
            'frame' => UploadedFile::fake()->image('frame-6.png', 900, 1200),
        ])
        ->assertRedirect('/catalog')
        ->assertSessionHasErrors('frame');

    $this->assertDatabaseMissing('twibone', [
        'name' => 'Campaign 6',
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
