<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\AddressRepository;
use App\Repositories\BrandRepository;
use App\Repositories\CategoryRepository;
use App\Repositories\Interfaces\AddressRepositoryInterface;
use App\Repositories\Interfaces\BrandRepositoryInterface;
use App\Repositories\Interfaces\CategoryRepositoryInterface;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Repositories\Interfaces\ProductReviewRepositoryInterface;
use App\Repositories\Interfaces\SettingRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\OrderRepository;
use App\Repositories\ProductRepository;
use App\Repositories\ProductReviewRepository;
use App\Repositories\SettingRepository;
use App\Repositories\UserRepository;
use App\Services\AddressService;
use App\Services\AuthService;
use App\Services\BrandService;
use App\Services\CategoryService;
use App\Services\Interfaces\AddressServiceInterface;
use App\Services\Interfaces\AuthServiceInterface;
use App\Services\Interfaces\BrandServiceInterface;
use App\Services\Interfaces\CategoryServiceInterface;
use App\Services\Interfaces\OrderServiceInterface;
use App\Services\Interfaces\ProductServiceInterface;
use App\Services\Interfaces\ProductReviewServiceInterface;
use App\Services\Interfaces\SettingServiceInterface;
use App\Services\Interfaces\UserServiceInterface;
use App\Services\OrderService;
use App\Services\ProductService;
use App\Services\ProductReviewService;
use App\Services\SettingService;
use App\Services\UserService;

class AppServiceProvider extends ServiceProvider
{

    protected $providers = [
        // Services
        AuthServiceInterface::class     => AuthService::class,
        AddressServiceInterface::class  => AddressService::class,
        SettingServiceInterface::class  => SettingService::class,
        CategoryServiceInterface::class => CategoryService::class,
        BrandServiceInterface::class    => BrandService::class,
        ProductServiceInterface::class  => ProductService::class,
        ProductReviewServiceInterface::class => ProductReviewService::class,
        OrderServiceInterface::class    => OrderService::class,
        UserServiceInterface::class     => UserService::class,

        // Repositories
        UserRepositoryInterface::class     => UserRepository::class,
        AddressRepositoryInterface::class  => AddressRepository::class,
        SettingRepositoryInterface::class  => SettingRepository::class,
        CategoryRepositoryInterface::class => CategoryRepository::class,
        BrandRepositoryInterface::class    => BrandRepository::class,
        ProductRepositoryInterface::class  => ProductRepository::class,
        ProductReviewRepositoryInterface::class => ProductReviewRepository::class,
        OrderRepositoryInterface::class    => OrderRepository::class,
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
