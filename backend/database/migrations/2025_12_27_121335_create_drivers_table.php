<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->string("email")->unique();
            $table->string("first_name");
            $table->string("last_name");
            $table->string("phone_number")->unique();
            $table->string("license_number")->unique();
            $table->string("password");
            $table->string("id_number")->unique();
            $table->string("vehicle_number")->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
