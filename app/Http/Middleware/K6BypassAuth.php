<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class K6BypassAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Bypass autentikasi dengan langsung set user di memori.
        // Ini menghindari masalah session locking di database saat load test (k6).
        if (User::find(1)) {
            Auth::setUser(User::find(1));
        }
        
        return $next($request);
    }
}
