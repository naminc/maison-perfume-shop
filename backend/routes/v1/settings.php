<?php

use App\Http\Controllers\Api\V1\SettingController;
use Illuminate\Support\Facades\Route;

Route::get('settings/public', [SettingController::class, 'publicSettings'])->name('settings.public');
Route::get('settings/maintenance', [SettingController::class, 'maintenance'])->name('settings.maintenance');
