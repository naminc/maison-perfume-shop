<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\AddressRepository;
use App\Repositories\Interfaces\AddressRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\UserRepository;
use App\Services\AddressService;
use App\Services\AuthService;
use App\Services\Interfaces\AddressServiceInterface;
use App\Services\Interfaces\AuthServiceInterface;

class AppServiceProvider extends ServiceProvider
{

    protected $providers = [
        // Services
        AuthServiceInterface::class    => AuthService::class,
        AddressServiceInterface::class => AddressService::class,

        // Repositories
        UserRepositoryInterface::class    => UserRepository::class,
        AddressRepositoryInterface::class => AddressRepository::class,
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
