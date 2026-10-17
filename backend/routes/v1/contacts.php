<?php

use App\Http\Controllers\Api\V1\ContactController;
use Illuminate\Support\Facades\Route;

Route::post('contacts', [ContactController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('contacts.store');
