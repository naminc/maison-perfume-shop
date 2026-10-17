<?php

namespace App\Services;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;
use App\Repositories\Interfaces\WishlistRepositoryInterface;
use App\Services\Interfaces\WishlistServiceInterface;
use Illuminate\Validation\ValidationException;

class WishlistService extends BaseService implements WishlistServiceInterface
{
    public function __construct(
        protected WishlistRepositoryInterface $wishlistRepository,
    ) {}

    public function getForUser(User $user): array
    {
        return $this->executeSafe(function () use ($user) {
            return $this->wishlistRepository->productsForUser($user->id);
        }, 'getForUser');
    }

    public function toggle(User $user, int $productId): array
    {
        return $this->executeTransaction(function () use ($user, $productId) {
            $this->assertProductIsAvailable($productId);

            $existing = $this->wishlistRepository->find($user->id, $productId);

            if ($existing) {
                $this->wishlistRepository->delete($existing);

                return ['product_id' => $productId, 'in_wishlist' => false];
            }

            $this->wishlistRepository->create($user->id, $productId);

            return ['product_id' => $productId, 'in_wishlist' => true];
        }, 'toggle');
    }

    public function remove(User $user, int $productId): array
    {
        return $this->executeTransaction(function () use ($user, $productId) {
            $existing = $this->wishlistRepository->find($user->id, $productId);

            if (! $existing) {
                return ['found' => false];
            }

            $this->wishlistRepository->delete($existing);

            return ['found' => true, 'deleted' => true];
        }, 'remove');
    }

    private function assertProductIsAvailable(int $productId): void
    {
        $product = Product::query()->find($productId);

        if (! $product) {
            throw ValidationException::withMessages([
                'product_id' => ['Sản phẩm không tồn tại.'],
            ]);
        }

        $status = $product->status instanceof ProductStatus ? $product->status->value : (string) $product->status;

        if ($status !== ProductStatus::Active->value) {
            throw ValidationException::withMessages([
                'product_id' => ['Sản phẩm đang tạm ẩn, không thể thêm vào danh sách yêu thích.'],
            ]);
        }
    }
}
