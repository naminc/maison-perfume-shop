<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('receiver_name');
            $table->string('receiver_phone', 20);
            $table->string('province_code', 10);
            $table->string('province_name');
            $table->string('ward_code', 10);
            $table->string('ward_name');
            $table->string('specific_address');
            $table->string('address_type', 20)->default('home');
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};
