<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('v1.')->group(function () {
    // Auth routes (public)
    require __DIR__ . '/v1/auth.php';

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        require __DIR__ . '/v1/user.php';
    });
});
