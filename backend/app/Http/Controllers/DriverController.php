<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Hash;
use App\Models\Driver;
use Carbon\Carbon;

class DriverController extends Controller
{
    public function index()
    {
        return Response::json(['message' => 'DriverController is working!']);
    }

    public function login(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $driver = Driver::where('email', $validatedData['email'])->first();

        if (!$driver || !Hash::check($validatedData['password'], $driver->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Create token with abilities
        $token = $driver->createToken('driver-api-token', ['driver:full'])->plainTextToken;

        // Return token for authentication
        return response()->json([
            "message" => "Login successful",
            "driver" => $driver,
            "token" => $token,
            "token_expires_at" => Carbon::now()->addDays(7)->toDateTimeString()
        ]);
    }
}
