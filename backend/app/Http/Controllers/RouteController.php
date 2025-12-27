<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Http;
use App\Models\Driver;
use App\Models\Location;

class RouteController extends Controller
{
    public function sendToApi(Request $request)
    {
        try {
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

            // TODO: Uncomment this when ready to send to actual API
            // $response = Http::post('https://your-api-endpoint.com/generate-routes', $dataToSend);
            // 
            // if ($response->successful()) {
            //     return response()->json([
            //         'message' => 'Data sent successfully to API',
            //         'api_response' => $response->json()
            //     ]);
            // } else {
            //     return response()->json([
            //         'message' => 'Error sending data to API',
            //         'error' => $response->body()
            //     ], $response->status());
            // }

            // For now, return the data to frontend for testing
            return response()->json([
                'message' => 'Data prepared successfully',
                'data' => $dataToSend,
                'drivers_count' => $drivers->count(),
                'locations_count' => $locations->count()
            ]);
        }
        catch (\Exception $e) {
            return response()->json([
                'message' => 'Error preparing data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
