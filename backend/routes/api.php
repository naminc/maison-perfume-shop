<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('v1.')->group(function () {
    require __DIR__ . '/v1/auth.php';
    require __DIR__ . '/v1/geo.php';

    Route::middleware('auth:sanctum')->group(function () {
        require __DIR__ . '/v1/account.php';
    });
});
