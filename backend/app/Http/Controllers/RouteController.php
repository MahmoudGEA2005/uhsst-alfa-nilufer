<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Http;
use App\Models\Driver;
use App\Models\Location;
use App\Models\RouteGenerationLog;
use Carbon\Carbon;

class RouteController extends Controller
{
    public function sendToApi(Request $request)
    {
        try {
            $today = Carbon::today()->toDateString();

            // Fetch all drivers with their data
            $drivers = Driver::all();
            
            // Fetch all locations with their data
            $locations = Location::all();

            // Prepare the data to send
            $dataToSend = [
                'drivers' => $drivers,
                'locations' => $locations,
                'timestamp' => now()->toDateTimeString(),
            ];

            $status = 'success';
            $generatedAt = now();

            // TODO: Uncomment this when ready to send to actual API
            // try {
            //     $response = Http::post('https://your-api-endpoint.com/generate-routes', $dataToSend);
            //     
            //     if (!$response->successful()) {
            //         $status = 'failed';
            //     }
            // } catch (\Exception $apiError) {
            //     $status = 'failed';
            // }

            // Save log (allow multiple per day)
            $log = RouteGenerationLog::create([
                'generation_date' => $today,
                'generated_at' => $generatedAt,
                'admin_id' => null, // TODO: Get from authenticated user
                'drivers_count' => $drivers->count(),
                'locations_count' => $locations->count(),
                'status' => $status,
            ]);

            // For now, return the data to frontend for testing
            return response()->json([
                'message' => 'Data prepared successfully',
                'data' => $dataToSend,
                'drivers_count' => $drivers->count(),
                'locations_count' => $locations->count(),
                // 'log' => $log
            ]);
        }
        catch (\Exception $e) {
            // Log failed attempt
            try {
                RouteGenerationLog::create([
                    'generation_date' => Carbon::today()->toDateString(),
                    'generated_at' => now(),
                    'admin_id' => null,
                    'drivers_count' => 0,
                    'locations_count' => 0,
                    'status' => 'failed',
                ]);
            } catch (\Exception $logError) {
                // Ignore if already exists
            }

            return response()->json([
                'message' => 'Error preparing data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
