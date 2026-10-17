<?php

use App\Http\Controllers\Api\V1\PostController;
use Illuminate\Support\Facades\Route;

Route::get('posts', [PostController::class, 'index'])->name('posts.index');
Route::get('posts/{slug}', [PostController::class, 'show'])->name('posts.show');
