<?php

use App\Http\Controllers\Api\V1\Admin\CategoryController;
use App\Http\Controllers\Api\V1\Admin\BrandController;
use App\Http\Controllers\Api\V1\Admin\CouponController;
use App\Http\Controllers\Api\V1\Admin\OrderController;
use App\Http\Controllers\Api\V1\Admin\ProductController;
use App\Http\Controllers\Api\V1\Admin\ProductReviewController;
use App\Http\Controllers\Api\V1\Admin\SettingController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('brands', BrandController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('coupons', CouponController::class);
    Route::get('product-reviews', [ProductReviewController::class, 'index'])->name('product-reviews.index');
    Route::get('product-reviews/{productReview}', [ProductReviewController::class, 'show'])->name('product-reviews.show');
    Route::patch('product-reviews/{productReview}/approve', [ProductReviewController::class, 'approve'])->name('product-reviews.approve');
    Route::patch('product-reviews/{productReview}/reject', [ProductReviewController::class, 'reject'])->name('product-reviews.reject');
    Route::patch('product-reviews/{productReview}', [ProductReviewController::class, 'update'])->name('product-reviews.update');
    Route::delete('product-reviews/{productReview}', [ProductReviewController::class, 'destroy'])->name('product-reviews.destroy');
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::apiResource('orders', OrderController::class)->only(['index', 'show', 'destroy']);
    Route::apiResource('users', UserController::class)->only(['index', 'show', 'update', 'destroy']);

    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
});
