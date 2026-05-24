<?php

namespace App\Services;

use App\Repositories\Interfaces\AddressRepositoryInterface;
use App\Services\Interfaces\AddressServiceInterface;

class AddressService extends BaseService implements AddressServiceInterface
{
    public function __construct(
        protected AddressRepositoryInterface $addressRepository,
    ) {}

    public function getAddresses(int $userId): array
    {
        return $this->executeSafe(function () use ($userId) {
            return $this->addressRepository->getAllByUser($userId)->toArray();
        }, 'getAddresses');
    }

    public function createAddress(int $userId, array $data): array
    {
        return $this->executeTransaction(function () use ($userId, $data) {
            $isFirst = $this->addressRepository->countByUser($userId) === 0;

            $data['user_id']    = $userId;
            $data['is_default'] = $isFirst || !empty($data['is_default']);

            if ($data['is_default'] && !$isFirst) {
                $this->addressRepository->clearDefaultForUser($userId);
            }

            return $this->addressRepository->create($data);
        }, 'createAddress');
    }

    public function updateAddress(int $userId, int $addressId, array $data): array
    {
        return $this->executeTransaction(function () use ($userId, $addressId, $data) {
            $address = $this->addressRepository->findByIdAndUser($addressId, $userId);

            if (! $address) {
                return ['found' => false];
            }

            if (!empty($data['is_default'])) {
                $this->addressRepository->clearDefaultForUser($userId);
            }

            return ['found' => true, 'address' => $this->addressRepository->update($address, $data)];
        }, 'updateAddress');
    }

    public function deleteAddress(int $userId, int $addressId): array
    {
        return $this->executeTransaction(function () use ($userId, $addressId) {
            $address = $this->addressRepository->findByIdAndUser($addressId, $userId);

            if (! $address) {
                return ['found' => false];
            }

            $wasDefault = $address->is_default;
            $this->addressRepository->delete($address);

            if ($wasDefault) {
                $next = $this->addressRepository->getAllByUser($userId)->first();
                if ($next) {
                    $this->addressRepository->update($next, ['is_default' => true]);
                }
            }

            return ['found' => true];
        }, 'deleteAddress');
    }

    public function setDefaultAddress(int $userId, int $addressId): array
    {
        return $this->executeTransaction(function () use ($userId, $addressId) {
            $address = $this->addressRepository->findByIdAndUser($addressId, $userId);

            if (! $address) {
                return ['found' => false];
            }

            $this->addressRepository->clearDefaultForUser($userId);
            $this->addressRepository->update($address, ['is_default' => true]);

            return ['found' => true];
        }, 'setDefaultAddress');
    }
}
