<?php

namespace App\Services\Interfaces;

interface AddressServiceInterface
{
    public function getAddresses(int $userId): array;
    public function createAddress(int $userId, array $data): array;
    public function updateAddress(int $userId, int $addressId, array $data): array;
    public function deleteAddress(int $userId, int $addressId): array;
    public function setDefaultAddress(int $userId, int $addressId): array;
}
