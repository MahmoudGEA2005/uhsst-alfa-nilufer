<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StatsController;
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
Route::get("/admins/all", [App\Http\Controllers\AdminController::class, 'all']);
Route::post("/admins/add", [App\Http\Controllers\AdminController::class, 'store']);
Route::post("/admins/login", [App\Http\Controllers\AdminController::class, 'login']);

Route::get("/locations", [App\Http\Controllers\LocationController::class, 'index']);
Route::get("/locations/all", [App\Http\Controllers\LocationController::class, 'indexAll']);
Route::post("/locations/add", [App\Http\Controllers\LocationController::class, 'store']);
Route::get("/locations/{id}", [App\Http\Controllers\LocationController::class, 'show']);
Route::put("/locations/{id}", [App\Http\Controllers\LocationController::class, 'update']);
Route::delete("/locations/{id}", [App\Http\Controllers\LocationController::class, 'destroy']);

Route::get("/routes/generate", [App\Http\Controllers\RouteController::class, 'sendToApi']);
Route::get("/routes/logs", [App\Http\Controllers\RouteGenerationLogController::class, 'index']);
Route::get("/routes/all", [App\Http\Controllers\RouteController::class, 'getAllDriverRoutes']);
Route::get("/routes/driver/{driverId}", [App\Http\Controllers\RouteController::class, 'getDriverRoutes']);

Route::get("/stats", [App\Http\Controllers\StatsController::class, 'getStats']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get("/drivers/auth/check", [App\Http\Controllers\DriverController::class, 'check']);
    Route::get("/admins/auth/check", [App\Http\Controllers\AdminController::class, 'check']);
});
