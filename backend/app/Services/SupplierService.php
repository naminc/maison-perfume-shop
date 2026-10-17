<?php

namespace App\Services;

use App\Enums\SupplierStatus;
use App\Repositories\Interfaces\SupplierRepositoryInterface;

class SupplierService extends BaseService implements \App\Services\Interfaces\SupplierServiceInterface
{
    public function __construct(protected SupplierRepositoryInterface $repository) {}

    public function getPaginated(array $filters): array
    {
        return $this->executeSafe(fn () => $this->repository->paginate($filters), 'getPaginated');
    }

    public function getById(int $id): array
    {
        return $this->executeSafe(fn () => $this->repository->findById($id), 'getById');
    }

    public function create(array $data): array
    {
        return $this->executeTransaction(fn () => $this->repository->create($this->payload($data)), 'create');
    }

    public function update(int $id, array $data): array
    {
        return $this->executeTransaction(function () use ($id, $data) {
            $supplier = $this->repository->findById($id);

            return $supplier ? ['found' => true, 'supplier' => $this->repository->update($supplier, $this->payload($data, $supplier->code))] : ['found' => false];
        }, 'update');
    }

    public function delete(int $id): array
    {
        return $this->executeTransaction(function () use ($id) {
            $supplier = $this->repository->findById($id);
            if (! $supplier) {
                return ['found' => false];
            }
            $this->repository->delete($supplier);

            return ['found' => true];
        }, 'delete');
    }

    private function payload(array $data, ?string $currentCode = null): array
    {
        $code = strtoupper(trim((string) ($data['code'] ?? '')));
        if ($code === '') {
            $code = $currentCode ?? $this->nextCode();
        }

        return [
            'name' => trim($data['name']), 'code' => $code,
            'contact_name' => $this->nullable($data['contact_name'] ?? null), 'phone' => $this->nullable($data['phone'] ?? null),
            'email' => $this->nullable($data['email'] ?? null), 'address' => $this->nullable($data['address'] ?? null),
            'tax_code' => $this->nullable($data['tax_code'] ?? null), 'note' => $this->nullable($data['note'] ?? null),
            'status' => $data['status'] ?? SupplierStatus::Active->value,
        ];
    }

    private function nextCode(): string
    {
        $number = 1;
        do {
            $code = 'SUP'.str_pad((string) $number++, 4, '0', STR_PAD_LEFT);
        } while ($this->repository->codeExists($code));

        return $code;
    }

    private function nullable(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
