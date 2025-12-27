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
}
