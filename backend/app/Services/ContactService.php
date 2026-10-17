<?php

namespace App\Services;

use App\Enums\ContactStatus;
use App\Repositories\Interfaces\ContactRepositoryInterface;
use App\Services\Interfaces\ContactServiceInterface;

class ContactService extends BaseService implements ContactServiceInterface
{
    public function __construct(
        protected ContactRepositoryInterface $contactRepository,
    ) {}

    public function getPaginated(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            return $this->contactRepository->paginate($filters);
        }, 'getPaginated');
    }

    public function getById(int $id): array
    {
        return $this->executeSafe(function () use ($id) {
            return $this->contactRepository->findById($id);
        }, 'getById');
    }

    public function create(array $data): array
    {
        return $this->executeTransaction(function () use ($data) {
            return $this->contactRepository->create([
                'name' => trim((string) $data['name']),
                'email' => strtolower(trim((string) $data['email'])),
                'phone' => $this->nullableString($data['phone'] ?? null),
                'subject' => $this->nullableString($data['subject'] ?? null),
                'message' => trim((string) $data['message']),
                'status' => ContactStatus::Pending->value,
            ]);
        }, 'create');
    }

    public function update(int $id, array $data): array
    {
        return $this->executeTransaction(function () use ($id, $data) {
            $contact = $this->contactRepository->findById($id);

            if (! $contact) {
                return ['found' => false];
            }

            $payload = [];

            if (array_key_exists('status', $data)) {
                $payload['status'] = $data['status'];
            }

            if (array_key_exists('admin_note', $data)) {
                $payload['admin_note'] = $this->nullableString($data['admin_note']);
            }

            return [
                'found' => true,
                'contact' => $payload === [] ? $contact : $this->contactRepository->update($contact, $payload),
            ];
        }, 'update');
    }

    public function delete(int $id): array
    {
        return $this->executeTransaction(function () use ($id) {
            $contact = $this->contactRepository->findById($id);

            if (! $contact) {
                return ['found' => false];
            }

            $this->contactRepository->delete($contact);

            return ['found' => true, 'deleted' => true];
        }, 'delete');
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }
}
