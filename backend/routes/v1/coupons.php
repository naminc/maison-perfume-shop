<?php

use App\Http\Controllers\Api\V1\CouponController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('coupons/validate', [CouponController::class, 'validateCoupon'])->name('coupons.validate');
});
