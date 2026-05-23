<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->name('register');
    Route::post('login',    [AuthController::class, 'login'])->middleware('throttle:5,1')->name('login');
    Route::post('refresh',  [AuthController::class, 'refresh'])->middleware('throttle:10,1')->name('refresh');

    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1')->name('forgot-password');
    Route::post('reset-password',  [AuthController::class, 'resetPassword'])->middleware('throttle:5,1')->name('reset-password');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('me',      [AuthController::class, 'me'])->name('me');
    });
});
