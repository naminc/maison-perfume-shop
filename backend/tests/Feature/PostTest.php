<?php

namespace Tests\Feature;

use App\Enums\PostStatus;
use App\Enums\UserRole;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_list_only_returns_published_posts(): void
    {
        $this->createPost(['title' => 'Bai da xuat ban']);
        $this->createPost([
            'title' => 'Bai nhap',
            'status' => PostStatus::Draft->value,
            'published_at' => null,
        ]);

        $response = $this->getJson('/api/v1/posts')->assertOk();

        $this->assertSame(1, $response->json('data.total'));
        $this->assertSame('Bai da xuat ban', $response->json('data.data.0.title'));
    }

    public function test_public_list_can_filter_by_category(): void
    {
        $this->createPost(['title' => 'Bai huong dan', 'category' => 'Hướng dẫn']);
        $this->createPost(['title' => 'Bai xu huong', 'category' => 'Xu hướng']);

        $response = $this->getJson('/api/v1/posts?category=' . rawurlencode('Xu hướng'))->assertOk();

        $this->assertSame(1, $response->json('data.total'));
        $this->assertSame('Bai xu huong', $response->json('data.data.0.title'));
    }

    public function test_public_can_view_published_post_by_slug(): void
    {
        $post = $this->createPost();

        $this->getJson("/api/v1/posts/{$post->slug}")
            ->assertOk()
            ->assertJsonPath('data.id', $post->id)
            ->assertJsonPath('data.title', $post->title);
    }

    public function test_draft_post_returns_404_on_public_detail(): void
    {
        $draft = $this->createPost([
            'status' => PostStatus::Draft->value,
            'published_at' => null,
        ]);

        $this->getJson("/api/v1/posts/{$draft->slug}")->assertNotFound();
        $this->getJson('/api/v1/posts/khong-ton-tai')->assertNotFound();
    }

    public function test_regular_user_cannot_access_admin_posts(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/posts')->assertForbidden();
        $this->postJson('/api/v1/admin/posts', [])->assertForbidden();
    }

    public function test_admin_can_create_post_with_auto_slug_and_published_at(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/posts', [
            'title' => 'Bài viết mới về nước hoa',
            'excerpt' => 'Mô tả ngắn.',
            'content' => 'Nội dung bài viết đủ dài.',
            'category' => 'Kiến thức',
            'status' => PostStatus::Published->value,
            'read_minutes' => 5,
        ])->assertCreated();

        $this->assertSame('bai-viet-moi-ve-nuoc-hoa', $response->json('data.slug'));
        $this->assertNotNull($response->json('data.published_at'));
    }

    public function test_slug_is_unique_when_titles_collide(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $this->createPost(['slug' => 'trung-slug', 'title' => 'Trung slug']);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/posts', [
            'title' => 'Trùng slug',
            'content' => 'Nội dung bài viết.',
            'status' => PostStatus::Draft->value,
        ])->assertCreated();

        $this->assertSame('trung-slug-2', $response->json('data.slug'));
    }

    public function test_admin_can_update_and_delete_post(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $post = $this->createPost(['status' => PostStatus::Draft->value, 'published_at' => null]);

        Sanctum::actingAs($admin);

        $this->putJson("/api/v1/admin/posts/{$post->id}", [
            'title' => $post->title,
            'slug' => $post->slug,
            'content' => 'Nội dung đã chỉnh sửa.',
            'status' => PostStatus::Published->value,
        ])->assertOk()
            ->assertJsonPath('data.status', PostStatus::Published->value)
            ->assertJsonPath('data.slug', $post->slug);

        $this->assertNotNull($post->fresh()->published_at);

        $this->deleteJson("/api/v1/admin/posts/{$post->id}")->assertOk();
        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    public function test_admin_list_can_filter_by_status(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $this->createPost();
        $this->createPost(['status' => PostStatus::Draft->value, 'published_at' => null]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/admin/posts')
            ->assertOk()
            ->assertJsonPath('data.total', 2);

        $this->getJson('/api/v1/admin/posts?status=draft')
            ->assertOk()
            ->assertJsonPath('data.total', 1);
    }

    public function test_post_creation_is_validated(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/admin/posts', [
            'title' => '',
            'content' => '',
            'status' => 'invalid',
            'cover_image' => 'not-a-url',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'content', 'status', 'cover_image']);
    }

    private function createPost(array $overrides = []): Post
    {
        $title = $overrides['title'] ?? 'Bai viet ' . Str::random(8);

        return Post::query()->create(array_merge([
            'title' => $title,
            'slug' => Str::slug($title) . '-' . Str::lower(Str::random(6)),
            'excerpt' => 'Mo ta ngan cho bai viet.',
            'content' => 'Noi dung bai viet du dai de hien thi.',
            'cover_image' => null,
            'category' => 'Kiến thức',
            'status' => PostStatus::Published->value,
            'published_at' => now()->subDay(),
            'read_minutes' => 5,
        ], $overrides));
    }
}
