<?php

use App\Http\Controllers\Api\V1\Account\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('account')->name('account.')->group(function () {
    Route::get('profile',  [ProfileController::class, 'show'])->name('profile.show');
    Route::put('profile',  [ProfileController::class, 'update'])->name('profile.update');
});