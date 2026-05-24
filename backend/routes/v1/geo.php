<?php

use App\Http\Controllers\Api\V1\GeoController;
use Illuminate\Support\Facades\Route;

Route::prefix('geo')->name('geo.')->group(function () {
    Route::get('provinces', [GeoController::class, 'provinces'])->name('provinces');
    Route::get('provinces/{code}/wards', [GeoController::class, 'wards'])->name('provinces.wards');
});
