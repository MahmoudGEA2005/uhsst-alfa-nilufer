<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get("/drivers", [App\Http\Controllers\DriverController::class, 'index']);
Route::post("/drivers/login", [App\Http\Controllers\DriverController::class, 'login']);

Route::get("/admins", [App\Http\Controllers\AdminController::class, 'index']);
Route::post("/admins/login", [App\Http\Controllers\AdminController::class, 'login']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get("/drivers/auth/check", [App\Http\Controllers\DriverController::class, 'check']);
    Route::get("/admins/auth/check", [App\Http\Controllers\AdminController::class, 'check']);
});