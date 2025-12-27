<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get("/drivers", [App\Http\Controllers\DriverController::class, 'index']);
Route::post("/drivers/login", [App\Http\Controllers\DriverController::class, 'login']);