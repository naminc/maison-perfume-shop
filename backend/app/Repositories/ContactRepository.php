<?php

namespace App\Repositories;

use App\Enums\ContactStatus;
use App\Models\Contact;
use App\Repositories\Interfaces\ContactRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ContactRepository implements ContactRepositoryInterface
{
    public function __construct(protected Contact $model) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 10);
        $perPage = max(1, min($perPage, 100));

        return $this->model
            ->newQuery()
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = trim((string) $filters['search']);

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%");
                });
            })
            ->when(! empty($filters['status']) && in_array($filters['status'], ContactStatus::values(), true), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Contact
    {
        return $this->model->newQuery()->find($id);
    }

    public function create(array $data): Contact
    {
        return $this->model->create($data);
    }

    public function update(Contact $contact, array $data): Contact
    {
        $contact->update($data);

        return $contact->fresh();
    }

    public function delete(Contact $contact): bool
    {
        return (bool) $contact->delete();
    }
}
