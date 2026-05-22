<?php

use Illuminate\Http\JsonResponse;

if (! function_exists('api_success')) {
    function api_success(mixed $data = null, string $message = 'Success', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }
}

if (! function_exists('api_created')) {
    function api_created(mixed $data = null, string $message = 'Created successfully'): JsonResponse
    {
        return api_success($data, $message, 201);
    }
}

if (! function_exists('api_no_content')) {
    function api_no_content(string $message = 'Deleted successfully'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => null,
        ], 200);
    }
}

if (! function_exists('api_error')) {
    function api_error(string $message = 'Something went wrong', int $status = 400, mixed $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], $status);
    }
}

if (! function_exists('api_not_found')) {
    function api_not_found(string $message = 'Resource not found'): JsonResponse
    {
        return api_error($message, 404);
    }
}

if (! function_exists('api_unauthorized')) {
    function api_unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return api_error($message, 401);
    }
}

if (! function_exists('api_forbidden')) {
    function api_forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return api_error($message, 403);
    }
}

if (! function_exists('api_validation_error')) {
    function api_validation_error(mixed $errors, string $message = 'Validation failed'): JsonResponse
    {
        return api_error($message, 422, $errors);
    }
}
