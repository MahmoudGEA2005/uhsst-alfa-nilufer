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
        Schema::create('route_generation_logs', function (Blueprint $table) {
            $table->id();
            $table->date('generation_date');          // e.g. 2025-12-27
            $table->timestamp('generated_at');         // exact time
            $table->foreignId('admin_id')->nullable(); // who clicked the button
            $table->integer('drivers_count');
            $table->integer('locations_count');
            $table->string('status')->default('success'); // success / failed
            $table->timestamps();

            $table->unique('generation_date'); // prevent double generation per day
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('route_generation_logs');
    }
};
