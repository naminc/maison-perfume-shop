<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Enums\UserRole;
use App\Enums\UserStatus;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'full_name' => 'Ngo Dinh Nam',
            'email' => 'admin@naminc.dev',
            'password' => Hash::make('naminc'),
            'role' => UserRole::Admin->value,
            'status' => UserStatus::Active->value,
        ]);
    }
}
