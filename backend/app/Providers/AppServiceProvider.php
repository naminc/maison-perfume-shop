<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\AddressRepository;
use App\Repositories\BrandRepository;
use App\Repositories\CategoryRepository;
use App\Repositories\ContactRepository;
use App\Repositories\CouponRepository;
use App\Repositories\Interfaces\AddressRepositoryInterface;
use App\Repositories\Interfaces\BrandRepositoryInterface;
use App\Repositories\Interfaces\CategoryRepositoryInterface;
use App\Repositories\Interfaces\ContactRepositoryInterface;
use App\Repositories\Interfaces\CouponRepositoryInterface;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Repositories\Interfaces\StockMovementRepositoryInterface;
use App\Repositories\Interfaces\SupplierRepositoryInterface;
use App\Repositories\Interfaces\PurchaseOrderRepositoryInterface;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Repositories\Interfaces\ProductReviewRepositoryInterface;
use App\Repositories\Interfaces\SettingRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\Interfaces\PostRepositoryInterface;
use App\Repositories\OrderRepository;
use App\Repositories\PostRepository;
use App\Repositories\ProductRepository;
use App\Repositories\ProductReviewRepository;
use App\Repositories\StockMovementRepository;
use App\Repositories\SupplierRepository;
use App\Repositories\PurchaseOrderRepository;
use App\Repositories\Interfaces\WishlistRepositoryInterface;
use App\Repositories\SettingRepository;
use App\Repositories\UserRepository;
use App\Repositories\WishlistRepository;
use App\Services\AddressService;
use App\Services\AuthService;
use App\Services\BrandService;
use App\Services\CategoryService;
use App\Services\ContactService;
use App\Services\CouponService;
use App\Services\DashboardService;
use App\Services\Interfaces\AddressServiceInterface;
use App\Services\Interfaces\AuthServiceInterface;
use App\Services\Interfaces\BrandServiceInterface;
use App\Services\Interfaces\CategoryServiceInterface;
use App\Services\Interfaces\ContactServiceInterface;
use App\Services\Interfaces\CouponServiceInterface;
use App\Services\Interfaces\DashboardServiceInterface;
use App\Services\Interfaces\OrderServiceInterface;
use App\Services\Interfaces\InventoryServiceInterface;
use App\Services\Interfaces\SupplierServiceInterface;
use App\Services\Interfaces\PurchaseOrderServiceInterface;
use App\Services\Interfaces\ProductServiceInterface;
use App\Services\Interfaces\ProductReviewServiceInterface;
use App\Services\Interfaces\SettingServiceInterface;
use App\Services\Interfaces\UserServiceInterface;
use App\Services\Interfaces\PostServiceInterface;
use App\Services\OrderService;
use App\Services\InventoryService;
use App\Services\SupplierService;
use App\Services\PurchaseOrderService;
use App\Services\PostService;
use App\Services\ProductService;
use App\Services\ProductReviewService;
use App\Services\Interfaces\WishlistServiceInterface;
use App\Services\SettingService;
use App\Services\UserService;
use App\Services\WishlistService;

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
        CouponServiceInterface::class   => CouponService::class,
        ContactServiceInterface::class  => ContactService::class,
        DashboardServiceInterface::class => DashboardService::class,
        PostServiceInterface::class     => PostService::class,
        ProductReviewServiceInterface::class => ProductReviewService::class,
        OrderServiceInterface::class    => OrderService::class,
        InventoryServiceInterface::class => InventoryService::class,
        SupplierServiceInterface::class => SupplierService::class,
        PurchaseOrderServiceInterface::class => PurchaseOrderService::class,
        UserServiceInterface::class     => UserService::class,
        WishlistServiceInterface::class => WishlistService::class,

        // Repositories
        UserRepositoryInterface::class     => UserRepository::class,
        AddressRepositoryInterface::class  => AddressRepository::class,
        SettingRepositoryInterface::class  => SettingRepository::class,
        CategoryRepositoryInterface::class => CategoryRepository::class,
        BrandRepositoryInterface::class    => BrandRepository::class,
        ProductRepositoryInterface::class  => ProductRepository::class,
        CouponRepositoryInterface::class   => CouponRepository::class,
        ContactRepositoryInterface::class  => ContactRepository::class,
        PostRepositoryInterface::class     => PostRepository::class,
        ProductReviewRepositoryInterface::class => ProductReviewRepository::class,
        OrderRepositoryInterface::class    => OrderRepository::class,
        StockMovementRepositoryInterface::class => StockMovementRepository::class,
        SupplierRepositoryInterface::class => SupplierRepository::class,
        PurchaseOrderRepositoryInterface::class => PurchaseOrderRepository::class,
        WishlistRepositoryInterface::class => WishlistRepository::class,
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
