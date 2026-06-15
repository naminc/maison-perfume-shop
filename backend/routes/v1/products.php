<?php

use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ProductReviewController;
use Illuminate\Support\Facades\Route;

Route::get('products', [ProductController::class, 'index'])->name('products.index');
Route::get('products/{slug}/reviews', [ProductReviewController::class, 'index'])->name('products.reviews.index');
Route::get('products/{slug}/reviews/summary', [ProductReviewController::class, 'summary'])->name('products.reviews.summary');
Route::get('products/{slug}', [ProductController::class, 'show'])->name('products.show');
