<?php

use App\Http\Controllers\Api\V1\BrandController;
use Illuminate\Support\Facades\Route;

Route::get('brands', [BrandController::class, 'index'])->name('brands.index');
