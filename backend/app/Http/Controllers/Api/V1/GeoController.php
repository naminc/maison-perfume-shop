<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Province;
use App\Models\Ward;
use Illuminate\Support\Facades\Cache;

class GeoController extends BaseController
{
    private const CACHE_TTL_SECONDS = 86400;

    public function provinces()
    {
        $provinces = Cache::remember('geo:provinces', self::CACHE_TTL_SECONDS, function () {
            return Province::query()
                ->select(['code', 'name', 'full_name', 'slug', 'type', 'is_central'])
                ->orderBy('name')
                ->get();
        });

        return api_success(data: $provinces, message: 'Lấy danh sách tỉnh/thành phố thành công.');
    }

    public function wards(string $code)
    {
        $wards = Cache::remember("geo:provinces:{$code}:wards", self::CACHE_TTL_SECONDS, function () use ($code) {
            return Ward::query()
                ->select(['code', 'name', 'full_name', 'slug', 'type', 'province_code'])
                ->where('province_code', $code)
                ->orderBy('name')
                ->get();
        });

        return api_success(data: $wards, message: 'Lấy danh sách phường/xã thành công.');
    }
}
