<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->foreignId('login_session_id')
                ->nullable()
                ->after('user_id')
                ->constrained('login_sessions')
                ->nullOnDelete();
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->foreignId('login_session_id')
                ->nullable()
                ->after('tokenable_id')
                ->constrained('login_sessions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropConstrainedForeignId('login_session_id');
        });

        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->dropConstrainedForeignId('login_session_id');
        });
    }
};
