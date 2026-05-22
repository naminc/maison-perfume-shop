<?php

use Illuminate\Support\Facades\Route;

// GET  /api/v1/users
// GET  /api/v1/users/{id}
// PUT  /api/v1/users/{id}
// DELETE /api/v1/users/{id}
Route::apiResource('users', \App\Http\Controllers\Api\V1\UserController::class);
