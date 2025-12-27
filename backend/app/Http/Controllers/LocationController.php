<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use App\Models\Location;

class LocationController extends Controller
{
    public function index()
    {
        return Response::json(['message' => 'LocationController is working!']);
    }

    public function indexAll()
    {
        $locations = Location::all();
        
        return response()->json([
            'message' => 'Locations retrieved successfully',
            'data' => $locations,
            'count' => $locations->count()
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'longitude' => 'required|numeric|between:-180,180',
                'latitude' => 'required|numeric|between:-90,90',
                'population' => 'nullable|integer|min:0',
                'home_residences' => 'nullable|integer|min:0',
                'companies' => 'nullable|integer|min:0',
                'stores' => 'nullable|integer|min:0',
            ]);

            // Set defaults for nullable fields
            $validatedData['population'] = $validatedData['population'] ?? 0;
            $validatedData['home_residences'] = $validatedData['home_residences'] ?? 0;
            $validatedData['companies'] = $validatedData['companies'] ?? 0;
            $validatedData['stores'] = $validatedData['stores'] ?? 0;

            // Create the location
            $location = Location::create($validatedData);

            return response()->json([
                'message' => 'Location created successfully',
                'data' => $location
            ], 201);
        }
        catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        }
        catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $location = Location::findOrFail($id);
            
            return response()->json([
                'message' => 'Location retrieved successfully',
                'data' => $location
            ]);
        }
        catch (\Exception $e) {
            return response()->json([
                'message' => 'Location not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $location = Location::findOrFail($id);

            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'longitude' => 'sometimes|required|numeric|between:-180,180',
                'latitude' => 'sometimes|required|numeric|between:-90,90',
                'population' => 'nullable|integer|min:0',
                'home_residences' => 'nullable|integer|min:0',
                'companies' => 'nullable|integer|min:0',
                'stores' => 'nullable|integer|min:0',
            ]);

            $location->update($validatedData);

            return response()->json([
                'message' => 'Location updated successfully',
                'data' => $location
            ]);
        }
        catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        }
        catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $location = Location::findOrFail($id);
            $location->delete();

            return response()->json([
                'message' => 'Location deleted successfully'
            ]);
        }
        catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting location',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
