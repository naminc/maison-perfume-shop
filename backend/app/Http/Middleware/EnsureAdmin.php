<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $role = $request->user()?->role;
        $isAdmin = $role instanceof UserRole
            ? $role === UserRole::Admin
            : $role === UserRole::Admin->value;

        if (! $isAdmin) {
            return api_error('Bạn không có quyền truy cập khu vực quản trị.', 403);
        }

        return $next($request);
    }
}
