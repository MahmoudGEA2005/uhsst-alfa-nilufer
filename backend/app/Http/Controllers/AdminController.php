<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function index()
    {
        return Response::json(['message' => 'AdminController is working!']);
    }

    public function login(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('email', $validatedData['email'])->first();

        if (!$admin || !Hash::check($validatedData['password'], $admin->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Create token with abilities
        $token = $admin->createToken('admin-api-token', ['admin:full'])->plainTextToken;

        // Return token for authentication
        return response()->json([
            "message" => "Login successful",
            "admin" => $admin,
            "token" => $token,
            "token_expires_at" => Carbon::now()->addDays(7)->toDateTimeString()
        ]);
    }

    public function check(Request $request)
    {
        $admin = $request->user('sanctum-admin');
        
        if (!$admin) {
            return response()->json([
                'message' => 'Unauthenticated',
                'authenticated' => false
            ], 401);
        }

        return response()->json([
            'message' => 'Admin is authenticated',
            'admin' => $admin,
            'authenticated' => true
        ]);
    }

    public function all(Request $request)
    {
        try {
            $admins = Admin::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'message' => 'Admins fetched successfully',
                'data' => $admins
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching admins',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:admins',
                'password' => 'required|string|min:6',
                'phone_number' => 'required|string|max:20',
                'admin_id_number' => 'required|string|max:50|unique:admins',
                'image' => 'nullable|file|image',
            ]);

            // Handle image upload if present
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('admins', 'public');
            }

            $admin = Admin::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'phone_number' => $validatedData['phone_number'],
                'admin_id_number' => $validatedData['admin_id_number'],
                'image' => $imagePath,
            ]);

            return response()->json([
                'message' => 'Admin created successfully',
                'data' => $admin
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating admin',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
