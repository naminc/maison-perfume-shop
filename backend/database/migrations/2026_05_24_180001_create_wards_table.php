<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wards', function (Blueprint $table) {
            $table->string('code', 10)->primary();
            $table->string('name');
            $table->string('full_name');
            $table->string('slug')->index();
            $table->enum('type', ['ward', 'commune']);
            $table->string('province_code', 10);
            $table->timestamps();

            $table->foreign('province_code')
                ->references('code')
                ->on('provinces')
                ->cascadeOnDelete();

            $table->index('province_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wards');
    }
};
