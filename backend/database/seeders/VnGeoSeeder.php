<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use RuntimeException;

class VnGeoSeeder extends Seeder
{
    private const CHUNK_SIZE = 500;

    public function run(): void
    {
        $now = now()->toDateTimeString();
        $provinces = $this->readJsonFile(database_path('data/provinces.json'));
        $wards = $this->readJsonFile(database_path('data/wards.json'));

        $this->seedProvinces($provinces, $now);
        $this->seedWards($wards, $now);

        Cache::forget('geo:provinces');
        collect($provinces)->each(
            fn (array $province) => Cache::forget("geo:provinces:{$province['code']}:wards")
        );
    }

    private function seedProvinces(array $provinces, string $timestamp): void
    {
        collect($provinces)
            ->map(fn (array $province) => [
                'code' => $province['code'],
                'name' => $province['name'],
                'full_name' => $province['fullName'],
                'slug' => $province['slug'],
                'type' => $province['type'],
                'is_central' => (bool) $province['isCentral'],
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ])
            ->chunk(self::CHUNK_SIZE)
            ->each(function ($chunk) {
                DB::table('provinces')->upsert(
                    $chunk->all(),
                    ['code'],
                    ['name', 'full_name', 'slug', 'type', 'is_central', 'updated_at'],
                );
            });
    }

    private function seedWards(array $wards, string $timestamp): void
    {
        collect($wards)
            ->map(fn (array $ward) => [
                'code' => $ward['code'],
                'name' => $ward['name'],
                'full_name' => $ward['fullName'],
                'slug' => $ward['slug'],
                'type' => $ward['type'],
                'province_code' => $ward['provinceCode'],
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ])
            ->chunk(self::CHUNK_SIZE)
            ->each(function ($chunk) {
                DB::table('wards')->upsert(
                    $chunk->all(),
                    ['code'],
                    ['name', 'full_name', 'slug', 'type', 'province_code', 'updated_at'],
                );
            });
    }

    private function readJsonFile(string $path): array
    {
        if (! File::exists($path)) {
            throw new RuntimeException("Missing geo data file: {$path}");
        }

        $data = json_decode(File::get($path), true);

        if (! is_array($data)) {
            throw new RuntimeException("Invalid geo data file: {$path}");
        }

        return $data;
    }
}
