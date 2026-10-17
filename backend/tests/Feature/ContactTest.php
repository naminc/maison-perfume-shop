<?php

namespace Tests\Feature;

use App\Enums\ContactStatus;
use App\Enums\UserRole;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_submit_contact_form(): void
    {
        $this->postJson('/api/v1/contacts', [
            'name' => 'Ngo Dinh Nam',
            'email' => 'Nam@Example.Test',
            'phone' => '0347101143',
            'subject' => 'Tu van nuoc hoa',
            'message' => 'Toi muon duoc tu van chon nuoc hoa nam mua he.',
        ])->assertCreated();

        $this->assertDatabaseHas('contacts', [
            'name' => 'Ngo Dinh Nam',
            'email' => 'nam@example.test',
            'status' => ContactStatus::Pending->value,
        ]);
    }

    public function test_contact_form_is_validated(): void
    {
        $this->postJson('/api/v1/contacts', [
            'name' => 'N',
            'email' => 'not-an-email',
            'message' => 'ngan',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'message']);
    }

    public function test_contact_form_is_rate_limited(): void
    {
        $payload = [
            'name' => 'Ngo Dinh Nam',
            'email' => 'nam@example.test',
            'message' => 'Toi muon duoc tu van chon nuoc hoa.',
        ];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/contacts', $payload)->assertCreated();
        }

        $this->postJson('/api/v1/contacts', $payload)->assertStatus(429);
    }

    public function test_regular_user_cannot_access_admin_contacts(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/contacts')->assertForbidden();
    }

    public function test_admin_can_list_and_filter_contacts(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $this->createContact(['name' => 'Nguyen Van A', 'email' => 'a@example.test']);
        $this->createContact([
            'name' => 'Tran Thi B',
            'email' => 'b@example.test',
            'status' => ContactStatus::Replied->value,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/admin/contacts')
            ->assertOk()
            ->assertJsonPath('data.total', 2);

        $this->getJson('/api/v1/admin/contacts?status=replied')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.email', 'b@example.test');

        $this->getJson('/api/v1/admin/contacts?search=Nguyen')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.email', 'a@example.test');
    }

    public function test_admin_can_update_contact_status_and_note(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $contact = $this->createContact();

        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/contacts/{$contact->id}", [
            'status' => ContactStatus::Replied->value,
            'admin_note' => 'Da goi dien tu van truc tiep.',
        ])->assertOk()
            ->assertJsonPath('data.status', ContactStatus::Replied->value)
            ->assertJsonPath('data.admin_note', 'Da goi dien tu van truc tiep.');

        $this->patchJson("/api/v1/admin/contacts/{$contact->id}", [
            'status' => 'invalid-status',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_admin_can_delete_contact(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $contact = $this->createContact();

        Sanctum::actingAs($admin);

        $this->deleteJson("/api/v1/admin/contacts/{$contact->id}")->assertOk();

        $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);

        $this->deleteJson("/api/v1/admin/contacts/{$contact->id}")->assertNotFound();
    }

    private function createContact(array $overrides = []): Contact
    {
        return Contact::query()->create(array_merge([
            'name' => 'Khach Test',
            'email' => 'khach@example.test',
            'phone' => '0900000000',
            'subject' => 'Can tu van',
            'message' => 'Noi dung tin nhan lien he du dai.',
            'status' => ContactStatus::Pending->value,
        ], $overrides));
    }
}
