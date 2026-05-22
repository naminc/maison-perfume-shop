<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\AuthService;
use App\Services\Interfaces\AuthServiceInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\UserRepository;

class AppServiceProvider extends ServiceProvider
{

    protected $providers = [
        // Services
        AuthServiceInterface::class => AuthService::class,

        // Repositories
        UserRepositoryInterface::class => UserRepository::class,
    ];
    /**
     * Register any application services.
     */
    public function register(): void
    {
        foreach ($this->providers as $interface => $implementation) {
            $this->app->bind($interface, $implementation);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
