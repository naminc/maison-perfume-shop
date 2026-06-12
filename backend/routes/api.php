<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('v1.')->group(function () {
    require __DIR__ . '/v1/auth.php';
    require __DIR__ . '/v1/geo.php';
    require __DIR__ . '/v1/categories.php';
    require __DIR__ . '/v1/brands.php';
    require __DIR__ . '/v1/products.php';
    require __DIR__ . '/v1/orders.php';
    require __DIR__ . '/v1/settings.php';

    Route::middleware('auth:sanctum')->group(function () {
        require __DIR__ . '/v1/account.php';
        require __DIR__ . '/v1/admin.php';
    });
});

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
