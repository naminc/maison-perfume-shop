<?php

namespace App\Repositories\Interfaces;

use App\Models\Contact;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ContactRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function findById(int $id): ?Contact;

    public function create(array $data): Contact;

    public function update(Contact $contact, array $data): Contact;

    public function delete(Contact $contact): bool;
}
