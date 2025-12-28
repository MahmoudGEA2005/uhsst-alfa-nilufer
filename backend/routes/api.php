<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\RouteGenerationLogController;


Route::get("/drivers", [App\Http\Controllers\DriverController::class, 'index']);
Route::get("/drivers/all", [App\Http\Controllers\DriverController::class, 'indexAll']);
Route::post("/drivers/add", [App\Http\Controllers\DriverController::class, 'store']);
Route::post("/drivers/login", [App\Http\Controllers\DriverController::class, 'login']);

Route::get("/admins", [App\Http\Controllers\AdminController::class, 'index']);
Route::post("/admins/login", [App\Http\Controllers\AdminController::class, 'login']);

Route::get("/locations", [App\Http\Controllers\LocationController::class, 'index']);
Route::get("/locations/all", [App\Http\Controllers\LocationController::class, 'indexAll']);
Route::post("/locations/add", [App\Http\Controllers\LocationController::class, 'store']);
Route::get("/locations/{id}", [App\Http\Controllers\LocationController::class, 'show']);
Route::put("/locations/{id}", [App\Http\Controllers\LocationController::class, 'update']);
Route::delete("/locations/{id}", [App\Http\Controllers\LocationController::class, 'destroy']);

Route::get("/routes/generate", [App\Http\Controllers\RouteController::class, 'sendToApi']);
Route::get("/routes/logs", [App\Http\Controllers\RouteGenerationLogController::class, 'index']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get("/drivers/auth/check", [App\Http\Controllers\DriverController::class, 'check']);
    Route::get("/admins/auth/check", [App\Http\Controllers\AdminController::class, 'check']);
});