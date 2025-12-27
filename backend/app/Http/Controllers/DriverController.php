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

    public function indexAll()
    {
        $drivers = Driver::all();
        
        return response()->json([
            'message' => 'Drivers retrieved successfully',
            'data' => $drivers,
            'count' => $drivers->count()
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:drivers,email',
            'phone_number' => 'required|string|unique:drivers,phone_number',
            'id_number' => 'required|string|unique:drivers,id_number',
            'license_number' => 'required|string|unique:drivers,license_number',
            'vehicle_number' => 'required|string|unique:drivers,vehicle_number',
            'password' => 'required|string|min:6',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif',
        ]);

        // Hash the password
        $validatedData['password'] = Hash::make($validatedData['password']);

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('drivers', $imageName, 'public');
            $validatedData['image'] = $imagePath;
        }

        // Create the driver
        $driver = Driver::create($validatedData);

        return response()->json([
            'message' => 'Driver created successfully',
            'data' => $driver
        ], 201);
        }
        catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating driver',
                'error' => $e->getMessage()
            ], 500);
        }
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

    public function check(Request $request)
    {
        $driver = $request->user('sanctum-driver');
        
        if (!$driver) {
            return response()->json([
                'message' => 'Unauthenticated',
                'authenticated' => false
            ], 401);
        }

        return response()->json([
            'message' => 'Driver is authenticated',
            'driver' => $driver,
            'authenticated' => true
        ]);
    }
}
