<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

abstract class BaseService
{
    /**
     * Try-catch + log. Không có transaction.
     * Dùng cho các thao tác đọc hoặc logic không cần rollback.
     *
     * Success → ['ok' => true,  'data' => <return value>]
     * Failure → ['ok' => false, 'message' => '...', 'exception' => Throwable]
     */
    protected function executeSafe(callable $action, string $context = ''): array
    {
        try {
            return ['ok' => true, 'data' => $action()];
        } catch (Throwable $e) {
            $this->logError($e, $context);

            return [
                'ok'        => false,
                'message'   => $e->getMessage(),
                'exception' => $e,
            ];
        }
    }

    /**
     * DB transaction + rollback tự động + log.
     * Dùng cho các thao tác ghi: create, update, delete nhiều bảng.
     *
     * Nếu bất kỳ bước nào throw exception → rollback toàn bộ → log lỗi.
     *
     * Success → ['ok' => true,  'data' => <return value>]
     * Failure → ['ok' => false, 'message' => '...', 'exception' => Throwable]
     */
    protected function executeTransaction(callable $action, string $context = ''): array
    {
        try {
            $result = DB::transaction(function () use ($action) {
                return $action();
            });

            return ['ok' => true, 'data' => $result];
        } catch (Throwable $e) {
            $this->logError($e, $context);

            return [
                'ok'        => false,
                'message'   => $e->getMessage(),
                'exception' => $e,
            ];
        }
    }

    protected function logInfo(string $message, array $context = []): void
    {
        Log::info("[{$this->className()}] {$message}", $context);
    }

    protected function logWarning(string $message, array $context = []): void
    {
        Log::warning("[{$this->className()}] {$message}", $context);
    }

    protected function logError(Throwable $e, string $context = ''): void
    {
        $label = $context ? "{$this->className()}.{$context}" : $this->className();

        Log::error("[{$label}] {$e->getMessage()}", [
            'exception' => get_class($e),
            'file'      => $e->getFile(),
            'line'      => $e->getLine(),
            'trace'     => $e->getTraceAsString(),
        ]);
    }

    private function className(): string
    {
        return class_basename(static::class);
    }
}
