<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use App\Models\RouteGenerationLog;

class RouteGenerationLogController extends Controller
{
    public function index()
    {
        $logs = RouteGenerationLog::with('admin')
            ->orderBy('generation_date', 'desc')
            ->get();
        
        return response()->json([
            'message' => 'Logs retrieved successfully',
            'data' => $logs,
            'count' => $logs->count()
        ]);
    }
}
