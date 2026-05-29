<?php

namespace App\Services\Interfaces;

interface UserServiceInterface
{
    public function getPaginated(array $filters): array;
    public function getById(int $id): array;
    public function update(int $id, array $data, int $actorId): array;
    public function delete(int $id, int $actorId): array;
}
