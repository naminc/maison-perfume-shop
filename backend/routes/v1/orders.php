<?php

use App\Http\Controllers\Api\V1\OrderController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/my', [OrderController::class, 'myOrders'])->name('orders.my');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
});
