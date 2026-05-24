<?php

use App\Http\Controllers\Api\V1\Account\AddressController;
use App\Http\Controllers\Api\V1\Account\PasswordController;
use App\Http\Controllers\Api\V1\Account\ProfileController;
use App\Http\Controllers\Api\V1\Account\SessionController;
use Illuminate\Support\Facades\Route;

Route::prefix('account')->name('account.')->group(function () {
    Route::get('profile',          [ProfileController::class,  'show'])->name('profile.show');
    Route::put('profile',          [ProfileController::class,  'update'])->name('profile.update');

    Route::put('change-password',  [PasswordController::class, 'change'])->name('password.change');
    Route::get('sessions',         [SessionController::class,  'index'])->name('sessions.index');

    Route::get('addresses',                [AddressController::class, 'index'])->name('addresses.index');
    Route::post('addresses',               [AddressController::class, 'store'])->name('addresses.store');
    Route::put('addresses/{id}',           [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('addresses/{id}',        [AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::patch('addresses/{id}/default', [AddressController::class, 'setDefault'])->name('addresses.set-default');
});
