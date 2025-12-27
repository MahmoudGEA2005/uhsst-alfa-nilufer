<?php

use Laravel\Sanctum\Sanctum;

return [

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,localhost:5175,127.0.0.1,127.0.0.1:8000,127.0.0.1:5175,::1',
        Sanctum::currentApplicationUrlWithPort(),
    ))),

    // Only include stateful guards, not API guards
    'guard' => ['web'],

    'expiration' => 60 * 24 * 7, // Set token expiration to 7 days (in minutes)

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];



app.ph. config 
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    |
    | This value is the name of your application, which will be used when the
    | framework needs to place the application's name in a notification or
    | other UI elements where an application name needs to be displayed.
    |
    */

    'name' => env('APP_NAME', 'Laravel'),

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    |
    | This value determines the "environment" your application is currently
    | running in. This may determine how you prefer to configure various
    | services the application utilizes. Set this in your ".env" file.
    |
    */

    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Application Debug Mode
    |--------------------------------------------------------------------------
    |
    | When your application is in debug mode, detailed error messages with
    | stack traces will be shown on every error that occurs within your
    | application. If disabled, a simple generic error page is shown.
    |
    */

    'debug' => (bool) env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    |
    | This URL is used by the console to properly generate URLs when using
    | the Artisan command line tool. You should set this to the root of
    | the application so that it's available within Artisan commands.
    |
    */

    'url' => env('APP_URL', 'http://localhost'),

    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default timezone for your application, which
    | will be used by the PHP date and date-time functions. The timezone
    | is set to "UTC" by default as it is suitable for most use cases.
    |
    */

    'timezone' => env('APP_TIMEZONE', 'UTC'),


    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    |
    | The application locale determines the default locale that will be used
    | by Laravel's translation / localization methods. This option can be
    | set to any locale for which you plan to have translation strings.
    |
    */

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    |
    | This key is utilized by Laravel's encryption services and should be set
    | to a random, 32 character string to ensure that all encrypted values
    | are secure. You should do this prior to deploying the application.
    |
    */

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode Driver
    |--------------------------------------------------------------------------
    |
    | These configuration options determine the driver used to determine and
    | manage Laravel's "maintenance mode" status. The "cache" driver will
    | allow maintenance mode to be controlled across multiple machines.
    |
    | Supported drivers: "file", "cache"
    |
    */

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];



app.php bootstrap
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
        ]);
        $middleware->alias([
            'check.admin.status' => \App\Http\Middleware\CheckAdminStatus::class,
            'check.photographer.status' => \App\Http\Middleware\CheckPhotographerStatus::class,
            'check.student.status' => \App\Http\Middleware\CheckStudentStatus::class,
            'check.super.admin' => \App\Http\Middleware\CheckSuperAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function ($request, $exception) {
            return $request->is('api/*');
        });
    })
    ->create(); // ✅ end cleanly, no scheduler here


    <?php

return [

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    'guards' => [
        'web' => ['driver' => 'session', 'provider' => 'users'],
        'sanctum' => ['driver' => 'sanctum', 'provider' => 'users'], // default API guard
        'sanctum-admin' => ['driver' => 'sanctum', 'provider' => 'admin_users'],
        'sanctum-student' => ['driver' => 'sanctum', 'provider' => 'student_users'],
        'sanctum-photographer' => ['driver' => 'sanctum', 'provider' => 'photographer_users'],
        // 'admin' => ['driver' => 'session', 'provider' => 'admin_users'],
        // 'student' => ['driver' => 'session', 'provider' => 'student_users'],
        // 'photographer' => ['driver' => 'session', 'provider' => 'photographer_users'],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => env('AUTH_MODEL', App\Models\User::class),
        ],
        'admin_users' => [
            'driver' => 'eloquent',
            'model' => App\Models\AdminUser::class,
        ],
        'student_users' => [
            'driver' => 'eloquent',
            'model' => App\Models\StudentUser::class,
        ],
        'photographer_users' => [
            'driver' => 'eloquent',
            'model' => App\Models\PhotographerUser::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
        'admin_users' => [
            'provider' => 'admin_users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
        'student_users' => [
            'provider' => 'student_users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
        'photographer_users' => [
            'provider' => 'photographer_users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\AdminUser;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;
use Carbon\Carbon;
use App\Models\HistoryLog;

    class AdminUserController extends Controller
    {
        public function check(Request $request)
        {
            $user = $request->user('sanctum-admin');
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            return Response::json([
                'message' => 'User is authenticated',
                'user' => $user,
                'authenticated' => true
            ]);
        }

    public function usersIndex(Request $request)
    {
        $query = AdminUser::query();
        
        // Apply role filter if provided and not 'all'
        if ($request->has('role') && $request->role && $request->role !== 'all') {
            $query->where('role', $request->role);
        }
        
        // Apply search filter if provided
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('first_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('last_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('username', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('email', 'LIKE', "%{$searchTerm}%");
            });
        }
        
        return Response::json($query->get());
    }

    public function createUser(Request $request)
    {
        $validatedData = $request->validate([
            'username' => 'required|string|max:255|unique:admin_users',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:admin_users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:15',
            'role' => 'required|in:super_user,admin',
        ]);


        if ($request->hasFile('profile_img')) {
            $imgPath = $request->file('profile_img')->store('admins', 'public');
            $validatedData['profile_image'] = $imgPath;
        }

        $validatedData['password'] = Hash::make($validatedData['password']);

        $user = AdminUser::create($validatedData);
        $user->refresh();

        $logMsg = $user->role == 'super_user' ? 'تم إنشاء مستخدم مسؤول رئيسي: ' : 'تم إنشاء مستخدم مسؤول: ';
        HistoryLog::create([
            'type' => 'ADM',
            'user_type' => 'ADMIN',
            'admin_user_id' => Auth::id(),
            'action_by' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
            'description' => $logMsg . $user->username,
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    public function login(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = AdminUser::where('email', $validatedData['email'])->first();

        if (!$user || !Hash::check($validatedData['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Create token with abilities
        $token = $user->createToken('admin-api-token', ['admin:full'])->plainTextToken;

        // Return token in HTTP-only cookie for security
        return response()->json([
            "message" => "Login successful",
            "user" => $user,
            "token" => $token,
            "token_expires_at" => Carbon::now()->addDays(7)->toDateTimeString()
        ]);
    }

    public function getUserData(Request $request)
    {
        return Response::json($request->user());
    }   

    public function update(Request $request, $id) {
        try {
            $user = AdminUser::findOrFail($id);

            $validator = $request->validate([
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'role' => 'sometimes|in:super_user,admin',
                'password' => 'sometimes|string|min:8',
                'password_confirmation' => 'sometimes|string|min:8',
                'profile_image' => 'sometimes|file|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            ]);

            // Validate password confirmation if password is provided
            if ($request->filled('password')) {
                if (!$request->filled('password_confirmation')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Password confirmation is required when updating password',
                    ], 422);
                }
                
                if ($request->password !== $request->password_confirmation) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Password and password confirmation do not match',
                    ], 422);
                }
            }

            // Handle profile image upload
            $imagePath = $user->profile_image; // Keep existing image by default
            if ($request->hasFile('profile_image')) {
                // Delete old image if it exists
                if ($user->profile_image) {
                    $oldImagePath = public_path('storage/' . $user->profile_image);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }

                $image = $request->file('profile_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('admins', $imageName, 'public');
            }

            // Prepare update data - only update fields that are provided and not empty
            $updateData = [];
            
            if ($request->filled('first_name')) {
                $updateData['first_name'] = $request->first_name;
            }
            
            if ($request->filled('last_name')) {
                $updateData['last_name'] = $request->last_name;
            }
            
            if ($request->filled('role')) {
                $updateData['role'] = $request->role;
            }
            
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }
            
            // Always update image path if there was an upload
            if ($request->hasFile('profile_image')) {
                $updateData['profile_image'] = $imagePath;
            }

            $user->update($updateData);

            HistoryLog::create([
                'type' => 'ADM',
                'user_type' => 'ADMIN',
                'admin_user_id' => Auth::id(),
                'action_by' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                'description' => 'تم تحديث المستخدم: ' . $user->username,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage(),
            ], 500);
        }
    }   

    public function logout(Request $request)
    {
        try {
            // Check if user is authenticated and has a token
            if ($request->user() && $request->user()->currentAccessToken()) {
                // Revoke current access token
                $request->user()->currentAccessToken()->delete();
            }
        } catch (\Exception $e) {
            // If there's any error with token deletion, we'll still proceed
            // This ensures logout works even with invalid/expired tokens
        }
        
        return response()->json([
            'message' => 'Logout successful'
        ])->withCookie(Cookie::forget('admin_token'));
    }

    public function toggleStatus(Request $request, $id)
    {
        try {
            $adminUser = AdminUser::findOrFail($id);
            
            // Toggle status between active and inactive
            $newStatus = $adminUser->status === 'active' ? 'inactive' : 'active';
            $adminUser->update(['status' => $newStatus]);
            HistoryLog::create([
                'type' => 'ADM',
                'user_type' => 'ADMIN',
                'admin_user_id' => Auth::id(),
                'action_by' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                'description' => 'تم تغيير حالة المستحدم: ' . $adminUser->username . ' إلى ' . $newStatus,
            ]);
            return response()->json([
                'success' => true,
                'message' => "حالة المسؤول تم تحديثها إلى {$newStatus}",
                'user' => $adminUser,
                'new_status' => $newStatus
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle admin user status: ' . $e->getMessage(),
            ], 500);
        }
    }
}


