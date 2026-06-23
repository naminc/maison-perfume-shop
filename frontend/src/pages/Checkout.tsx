import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import {
  ArrowLeft,
  Check,
  MapPin,
  Package,
  ShoppingBag,
  TicketPercent,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { useAddresses } from "@/hooks/useAddressQueries";
import { useCartProducts } from "@/hooks/useCartProducts";
import { useValidateCoupon } from "@/hooks/useCoupons";
import { useProvinces, useWards } from "@/hooks/useGeoQueries";
import { useCreateOrder } from "@/hooks/useOrders";
import { formatAddressParts, formatWardDisplayName } from "@/lib/address-format";
import { wasApiConnectionNotified } from "@/lib/api";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  formatVnd,
} from "@/lib/product-utils";
import type { ApiErrorResponse } from "@/types/auth";
import type { UserAddress } from "@/types/address";
import type { ValidateCouponResponse } from "@/types/coupon";
import type { OrderPayload, PaymentMethod, ShippingMethod } from "@/types/order";

const NEW_ADDRESS_VALUE = "new";

const SHIP_OPTIONS: Array<{ id: ShippingMethod; label: string; desc: string; fee: number }> = [
  { id: "standard", label: "Giao tiêu chuẩn", desc: "2-4 ngày", fee: STANDARD_SHIPPING_FEE },
  { id: "express", label: "Giao nhanh", desc: "Trong 24h tại nội thành", fee: 60000 },
];

const PAY_OPTIONS: Array<{ id: PaymentMethod; label: string; icon: typeof Wallet }> = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: Wallet },
];

const ADDRESS_TYPE_LABELS: Record<UserAddress["address_type"], string> = {
  home: "Nhà riêng",
  office: "Văn phòng",
  other: "Khác",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    cartCount,
    lines,
    purchasableLines,
    purchasableCount,
    subtotal,
    productsQuery,
    hasCartIssues,
    clearCart,
  } = useCartProducts();
  const createOrder = useCreateOrder();
  const validateCoupon = useValidateCoupon();
  const addressesQuery = useAddresses();
  const provincesQuery = useProvinces();
  const didInitializeAddress = useRef(false);

  const [ship, setShip] = useState<ShippingMethod>("standard");
  const [pay, setPay] = useState<PaymentMethod>("cod");
  const [selectedAddressKey, setSelectedAddressKey] = useState<string>(NEW_ADDRESS_VALUE);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [note, setNote] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null);
  const [couponError, setCouponError] = useState("");

  const isNewAddress = selectedAddressKey === NEW_ADDRESS_VALUE;
  const wardsQuery = useWards(isNewAddress ? selectedProvinceCode : "");
  const savedAddresses = addressesQuery.data ?? [];
  const selectedSavedAddress = useMemo(
    () => savedAddresses.find((address) => String(address.id) === selectedAddressKey) ?? null,
    [savedAddresses, selectedAddressKey],
  );
  const selectedSavedAddressUsable = selectedSavedAddress ? isSavedAddressUsable(selectedSavedAddress) : false;
  const provinces = provincesQuery.data ?? [];
  const wards = wardsQuery.data ?? [];
  const selectedProvince = useMemo(
    () => provinces.find((province) => province.code === selectedProvinceCode) ?? null,
    [provinces, selectedProvinceCode],
  );
  const selectedWard = useMemo(
    () => wards.find((ward) => ward.code === selectedWardCode) ?? null,
    [selectedWardCode, wards],
  );
  const couponCartKey = useMemo(
    () => purchasableLines.map((line) => `${line.productId}:${line.quantity}`).join("|"),
    [purchasableLines],
  );

  useEffect(() => {
    if (didInitializeAddress.current || addressesQuery.isLoading) return;

    setCustomerEmail(user?.email ?? "");

    if (addressesQuery.isError || savedAddresses.length === 0) {
      startNewAddress(false);
      didInitializeAddress.current = true;
      return;
    }

    const preferred = savedAddresses.find((address) => address.is_default && isSavedAddressUsable(address))
      ?? savedAddresses.find(isSavedAddressUsable);

    if (preferred) {
      selectSavedAddress(preferred);
    } else {
      startNewAddress(false);
    }

    didInitializeAddress.current = true;
  }, [addressesQuery.isError, addressesQuery.isLoading, savedAddresses, user]);

  useEffect(() => {
    setAppliedCoupon(null);
    setCouponError("");
  }, [couponCartKey, ship]);

  const selectedShip = SHIP_OPTIONS.find((option) => option.id === ship) ?? SHIP_OPTIONS[0];
  const shipping = ship === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : selectedShip.fee;
  const discount = Number(appliedCoupon?.discount_total ?? 0);
  const total = appliedCoupon ? Number(appliedCoupon.total) : Math.max(0, subtotal + shipping - discount);
  const isNewAddressReady =
    isNewAddress &&
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    customerEmail.trim().length > 0 &&
    shippingAddress.trim().length > 0 &&
    Boolean(selectedProvince) &&
    Boolean(selectedWard);
  const hasGeoIssues =
    isNewAddress &&
    (provincesQuery.isError || (Boolean(selectedProvinceCode) && wardsQuery.isError));
  const canPlaceOrder =
    purchasableLines.length > 0 &&
    !hasCartIssues &&
    !hasGeoIssues &&
    (selectedSavedAddressUsable || isNewAddressReady) &&
    !productsQuery.isLoading &&
    !productsQuery.isError &&
    !(isNewAddress && (provincesQuery.isLoading || wardsQuery.isLoading)) &&
    !validateCoupon.isPending &&
    !createOrder.isPending;

  function selectSavedAddress(address: UserAddress) {
    if (!isSavedAddressUsable(address)) return;

    setSelectedAddressKey(String(address.id));
    setCustomerName(address.receiver_name);
    setCustomerPhone(address.receiver_phone);
    setSelectedProvinceCode(address.province_code);
    setSelectedWardCode(address.ward_code);
    setShippingAddress(address.specific_address);
  }

  function startNewAddress(clearAddress = true) {
    setSelectedAddressKey(NEW_ADDRESS_VALUE);
    setCustomerName(user?.full_name ?? "");
    setCustomerPhone(user?.phone ?? "");
    if (clearAddress) {
      setSelectedProvinceCode("");
      setSelectedWardCode("");
      setShippingAddress("");
    }
  }

  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvinceCode(provinceCode);
    setSelectedWardCode("");
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponError("Vui lòng nhập mã giảm giá.");
      return;
    }

    if (purchasableLines.length === 0) {
      setCouponError("Không có sản phẩm hợp lệ để áp dụng mã giảm giá.");
      return;
    }

    validateCoupon.mutate(
      {
        code,
        shipping_method: ship,
        items: purchasableLines.map((line) => ({
          product_id: line.productId,
          quantity: line.quantity,
        })),
      },
      {
        onSuccess: (result) => {
          setAppliedCoupon(result);
          setCouponInput(result.coupon.code);
          setCouponError("");
          toast.success(`Đã áp dụng mã ${result.coupon.code}.`);
        },
        onError: (error) => {
          if (wasApiConnectionNotified(error)) return;
          setAppliedCoupon(null);
          setCouponError(getApiErrorMessage(error, "Mã giảm giá không hợp lệ."));
        },
      },
    );
  };

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (cart.length === 0) {
      toast.error("Giỏ hàng đang trống");
      return;
    }

    const addressPayload = selectedSavedAddressUsable && selectedSavedAddress
      ? {
          customer_name: selectedSavedAddress.receiver_name,
          customer_phone: selectedSavedAddress.receiver_phone,
          province_code: selectedSavedAddress.province_code,
          province_name: selectedSavedAddress.province_name,
          ward_code: selectedSavedAddress.ward_code,
          ward_name: selectedSavedAddress.ward_name,
          shipping_address: selectedSavedAddress.specific_address,
        }
      : selectedProvince && selectedWard
        ? {
            customer_name: customerName.trim(),
            customer_phone: customerPhone.trim(),
            province_code: selectedProvince.code,
            province_name: selectedProvince.full_name,
            ward_code: selectedWard.code,
            ward_name: formatWardDisplayName(selectedWard.full_name, selectedProvince.full_name),
            shipping_address: shippingAddress.trim(),
          }
        : null;

    if (!addressPayload) {
      toast.error("Vui lòng chọn địa chỉ đã lưu hoặc nhập địa chỉ mới");
      return;
    }

    if (!canPlaceOrder) {
      toast.error("Vui lòng kiểm tra lại sản phẩm và địa chỉ trước khi đặt hàng");
      return;
    }

    const payload: OrderPayload = {
      ...addressPayload,
      customer_email: customerEmail.trim() || null,
      note: note.trim() || null,
      payment_method: pay,
      shipping_method: ship,
      coupon_code: appliedCoupon?.coupon.code ?? null,
      items: purchasableLines.map((line) => ({
        product_id: line.productId,
        quantity: line.quantity,
      })),
    };

    createOrder.mutate(payload, {
      onSuccess: (order) => {
        toast.success(`Đặt hàng thành công! Mã đơn #${order.order_code}`);
        clearCart();
        navigate("/checkout/success", {
          state: {
            orderCode: order.order_code,
            orderId: order.order_code,
            total: Number(order.total),
            email: order.customer_email,
          },
        });
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        if (hasApiFieldError(error, "coupon_code")) {
          setAppliedCoupon(null);
        }
        toast.error(getApiErrorMessage(error, "Đặt hàng thất bại. Vui lòng thử lại."));
      },
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <nav className="text-xs text-stone-500">
            <Link to="/" className="hover:text-stone-900">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to="/cart" className="hover:text-stone-900">Giỏ hàng</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-900">Thanh toán</span>
          </nav>
          <Link to="/cart" className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại giỏ hàng
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight">Thanh toán</h1>

        {cart.length === 0 ? (
          <EmptyCheckout />
        ) : productsQuery.isLoading ? (
          <CheckoutSkeleton />
        ) : productsQuery.isError ? (
          <StateBox title="Không thể tải đơn hàng" description="Vui lòng thử lại sau." />
        ) : (
          <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <section className="rounded-xl border border-stone-200 bg-white p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Thông tin giao hàng</h2>
                  <Link to="/account/addresses" className="text-xs font-medium text-amber-700 hover:underline">
                    Quản lý địa chỉ
                  </Link>
                </div>

                <SavedAddressPicker
                  addresses={savedAddresses}
                  selectedKey={selectedAddressKey}
                  isLoading={addressesQuery.isLoading}
                  isError={addressesQuery.isError}
                  onRetry={() => addressesQuery.refetch()}
                  onSelectSaved={selectSavedAddress}
                  onSelectNew={() => startNewAddress(true)}
                />

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Họ và tên"
                    value={customerName}
                    onChange={setCustomerName}
                    placeholder="Nguyễn Văn A"
                    required
                    disabled={!isNewAddress}
                  />
                  <Field
                    label="Số điện thoại"
                    value={customerPhone}
                    onChange={setCustomerPhone}
                    placeholder="09xx xxx xxx"
                    required
                    disabled={!isNewAddress}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Email"
                      type="email"
                      value={customerEmail}
                      onChange={setCustomerEmail}
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  {selectedSavedAddressUsable && selectedSavedAddress ? (
                    <>
                      <ReadonlyField label="Tỉnh/Thành phố" value={selectedSavedAddress.province_name} />
                      <ReadonlyField label="Phường/Xã" value={selectedSavedAddress.ward_name} />
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="mb-1.5 block text-sm font-medium text-stone-700">
                          Tỉnh/Thành phố <span className="text-red-500">*</span>
                        </Label>
                        <Select value={selectedProvinceCode} onValueChange={handleProvinceChange} disabled={provincesQuery.isLoading}>
                          <SelectTrigger className="h-11 rounded-lg bg-stone-50 focus:border-stone-400">
                            <SelectValue placeholder={provincesQuery.isLoading ? "Đang tải..." : "Chọn tỉnh/thành phố"} />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {provinces.map((province) => (
                              <SelectItem key={province.code} value={province.code}>
                                {province.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {provincesQuery.isError && (
                          <button type="button" onClick={() => provincesQuery.refetch()} className="mt-1 text-xs text-amber-700 hover:underline">
                            Không thể tải tỉnh/thành phố. Thử lại
                          </button>
                        )}
                      </div>

                      <div>
                        <Label className="mb-1.5 block text-sm font-medium text-stone-700">
                          Phường/Xã <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={selectedWardCode}
                          onValueChange={setSelectedWardCode}
                          disabled={!selectedProvinceCode || wardsQuery.isLoading || wardsQuery.isError}
                        >
                          <SelectTrigger className="h-11 rounded-lg bg-stone-50 focus:border-stone-400">
                            <SelectValue
                              placeholder={
                                !selectedProvinceCode
                                  ? "Chọn tỉnh/thành phố trước"
                                  : wardsQuery.isLoading
                                    ? "Đang tải..."
                                    : "Chọn phường/xã"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {wards.map((ward) => (
                              <SelectItem key={ward.code} value={ward.code}>
                                {ward.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {wardsQuery.isError && (
                          <button type="button" onClick={() => wardsQuery.refetch()} className="mt-1 text-xs text-amber-700 hover:underline">
                            Không thể tải phường/xã. Thử lại
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <Field
                      label="Địa chỉ cụ thể"
                      value={shippingAddress}
                      onChange={setShippingAddress}
                      placeholder="Số nhà, tên đường, khu phố..."
                      required
                      disabled={!isNewAddress}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block text-sm font-medium text-stone-700">Ghi chú</Label>
                    <Textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Lưu ý cho người giao hàng (tuỳ chọn)"
                      className="min-h-[80px] rounded-lg border-input bg-stone-50"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-stone-200 bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Truck className="h-5 w-5" />Phương thức vận chuyển
                </h2>
                <div className="space-y-2">
                  {SHIP_OPTIONS.map((option) => {
                    const fee = option.id === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : option.fee;
                    return (
                      <Option key={option.id} active={ship === option.id} onClick={() => setShip(option.id)}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-stone-500">{option.desc}</div>
                        </div>
                        <div className="font-semibold">{fee === 0 ? "Miễn phí" : formatVnd(fee)}</div>
                      </Option>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-stone-200 bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Wallet className="h-5 w-5" />Phương thức thanh toán
                </h2>
                <p className="mb-3 text-sm text-stone-500">
                  Hiện tại Maison chỉ hỗ trợ thanh toán khi nhận hàng.
                </p>
                <div className="space-y-2">
                  {PAY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Option key={option.id} active={pay === option.id} onClick={() => setPay(option.id)}>
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-stone-600" />
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </Option>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Đơn hàng ({cartCount})</h2>

                {hasCartIssues && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    Có sản phẩm cần cập nhật trong giỏ. Vui lòng quay lại giỏ hàng để xoá hoặc chỉnh số lượng trước khi đặt hàng.
                  </div>
                )}

                <ul className="space-y-3 border-b border-stone-200 pb-4">
                  {lines.map((line) => {
                    const product = line.product;
                    const lineTotal = product ? Number(product.sale_price ?? product.price) * line.quantity : 0;
                    const warning = line.unavailableReason ?? line.stockWarning;

                    return (
                      <li key={line.productId} className="flex gap-3">
                        <div className="relative shrink-0">
                          {product?.image ? (
                            <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
                          ) : (
                            <div className="grid h-14 w-14 place-items-center rounded-lg bg-stone-100 text-stone-400">
                              <Package className="h-5 w-5" strokeWidth={1.5} />
                            </div>
                          )}
                          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-stone-900 text-[10px] text-white">
                            {line.requestedQuantity}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{product?.name ?? `Sản phẩm #${line.productId}`}</p>
                          <p className="text-xs text-stone-500">
                            {product
                              ? [product.brand?.name, product.volume_ml ? `${product.volume_ml}ml` : null].filter(Boolean).join(" · ")
                              : "Không còn trong catalogue"}
                          </p>
                          {warning && <p className="mt-1 text-xs text-amber-700">{warning}</p>}
                        </div>
                        <div className="text-sm font-semibold">{lineTotal > 0 ? formatVnd(lineTotal) : "-"}</div>
                      </li>
                    );
                  })}
                </ul>

                <div className="border-b border-stone-200 py-4">
                  <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-700">
                    <TicketPercent className="h-4 w-4" />
                    Mã giảm giá
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(event) => {
                        const nextCode = event.target.value.toUpperCase();
                        setCouponInput(nextCode);
                        setCouponError("");
                        if (appliedCoupon && nextCode !== appliedCoupon.coupon.code) {
                          setAppliedCoupon(null);
                        }
                      }}
                      placeholder="WELCOME10"
                      disabled={validateCoupon.isPending}
                      className="h-10 rounded-lg border-input bg-stone-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={applyCoupon}
                      disabled={validateCoupon.isPending || purchasableLines.length === 0}
                      className="h-10 rounded-lg border-stone-300"
                    >
                      {validateCoupon.isPending ? "Đang kiểm tra..." : "Áp dụng"}
                    </Button>
                  </div>
                  {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                      <span>
                        Đã áp dụng {appliedCoupon.coupon.code}: -{formatVnd(appliedCoupon.discount_total)}
                      </span>
                      <button
                        type="button"
                        onClick={clearCoupon}
                        className="grid h-6 w-6 place-items-center rounded-full hover:bg-emerald-100"
                        aria-label="Bỏ mã giảm giá"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <dl className="space-y-2.5 py-4 text-sm">
                  <div className="flex justify-between text-stone-600"><dt>Tạm tính</dt><dd>{formatVnd(subtotal)}</dd></div>
                  <div className="flex justify-between text-stone-600"><dt>Vận chuyển</dt><dd>{shipping === 0 ? "Miễn phí" : formatVnd(shipping)}</dd></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Giảm giá</dt><dd>-{formatVnd(discount)}</dd></div>}
                </dl>

                <div className="flex items-end justify-between border-t border-stone-200 pt-4">
                  <span className="text-sm text-stone-500">Tổng cộng</span>
                  <span className="text-2xl font-semibold">{formatVnd(total)}</span>
                </div>

                <Button
                  type="submit"
                  disabled={!canPlaceOrder}
                  className="mt-5 h-12 w-full rounded-lg bg-stone-900 text-base text-white hover:bg-stone-800"
                >
                  {createOrder.isPending ? "Đang tạo đơn..." : "Đặt hàng"}
                </Button>
                <p className="mt-3 text-center text-xs text-stone-400">
                  {purchasableCount > 0
                    ? "Bằng việc đặt hàng, bạn đồng ý với điều khoản của Maison."
                    : "Không có sản phẩm khả dụng để đặt hàng."}
                </p>
              </div>
            </aside>
          </form>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function SavedAddressPicker({
  addresses,
  selectedKey,
  isLoading,
  isError,
  onRetry,
  onSelectSaved,
  onSelectNew,
}: {
  addresses: UserAddress[];
  selectedKey: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelectSaved: (address: UserAddress) => void;
  onSelectNew: () => void;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-800">
        <MapPin className="h-4 w-4" />
        Địa chỉ đã lưu
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-lg bg-white" />
          <div className="h-28 animate-pulse rounded-lg bg-white" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Không thể tải địa chỉ đã lưu. Bạn vẫn có thể nhập địa chỉ mới.
          <button type="button" onClick={onRetry} className="ml-2 font-semibold underline">
            Thử lại
          </button>
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-3 text-sm text-stone-600">
          Bạn chưa có địa chỉ đã lưu. Hãy nhập địa chỉ mới cho đơn hàng này.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => {
            const usable = isSavedAddressUsable(address);
            const active = selectedKey === String(address.id);

            return (
              <button
                key={address.id}
                type="button"
                disabled={!usable}
                onClick={() => onSelectSaved(address)}
                className={`rounded-lg border bg-white p-3 text-left transition-colors ${
                  active ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200 hover:border-stone-400"
                } ${!usable ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-stone-900">{address.receiver_name}</div>
                    <div className="mt-0.5 text-xs text-stone-500">{address.receiver_phone}</div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {active && <Check className="h-4 w-4 text-stone-900" />}
                    {address.is_default && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        Mặc định
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-stone-500">
                  {ADDRESS_TYPE_LABELS[address.address_type]}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-stone-700">
                  {formatUserAddress(address)}
                </p>
                {!usable && (
                  <p className="mt-2 text-xs text-red-600">Địa chỉ này thiếu thông tin tỉnh/phường, không thể dùng để đặt hàng.</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onSelectNew}
        className={`mt-3 flex w-full items-center justify-between rounded-lg border border-dashed p-3 text-left text-sm transition-colors ${
          selectedKey === NEW_ADDRESS_VALUE
            ? "border-stone-900 bg-white text-stone-900"
            : "border-stone-300 bg-white/70 text-stone-700 hover:border-stone-500"
        }`}
      >
        <span className="font-medium">Nhập địa chỉ mới</span>
        {selectedKey === NEW_ADDRESS_VALUE && <Check className="h-4 w-4" />}
      </button>
    </div>
  );
}

function EmptyCheckout() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-stone-100">
        <ShoppingBag className="h-7 w-7 text-stone-400" />
      </div>
      <h2 className="text-lg font-medium">Chưa có sản phẩm để thanh toán</h2>
      <p className="mt-1 text-sm text-stone-500">Thêm sản phẩm vào giỏ trước khi đặt hàng.</p>
      <Button asChild className="mt-6 h-11 rounded-lg bg-stone-900 px-6 text-white hover:bg-stone-800">
        <Link to="/shop">Quay lại cửa hàng</Link>
      </Button>
    </div>
  );
}

function StateBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
      <ShoppingBag className="mx-auto h-10 w-10 text-stone-300" strokeWidth={1.5} />
      <h2 className="mt-3 text-lg font-medium text-stone-900">{title}</h2>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <div className="h-72 animate-pulse rounded-xl bg-stone-100" />
        <div className="h-40 animate-pulse rounded-xl bg-stone-100" />
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-stone-100" />
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
  disabled,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}{required && <span className="text-red-500"> *</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="h-11 rounded-lg border-input bg-stone-50 focus-visible:ring-amber-500 disabled:opacity-75"
      />
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium text-stone-700">
        {label} <span className="text-red-500">*</span>
      </Label>
      <Input
        value={value}
        readOnly
        disabled
        className="h-11 rounded-lg border-input bg-stone-50 disabled:opacity-75"
      />
    </div>
  );
}

function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors ${
        active ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-400"
      }`}
    >
      <div className="flex flex-1 items-center justify-between gap-4">{children}</div>
      <div className={`ml-4 grid h-5 w-5 place-items-center rounded-full border-2 ${active ? "border-stone-900 bg-stone-900" : "border-stone-300"}`}>
        {active && <Check className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}

function formatUserAddress(address: UserAddress) {
  return formatAddressParts([address.specific_address, address.ward_name, address.province_name]);
}

function isSavedAddressUsable(address: UserAddress) {
  return Boolean(
    address.receiver_name &&
    address.receiver_phone &&
    address.province_code &&
    address.province_name &&
    address.ward_code &&
    address.ward_name &&
    address.specific_address,
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<ApiErrorResponse>;
  const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
  const firstError = errors ? Object.values(errors).flat().find(Boolean) : undefined;

  return firstError ?? err.response?.data?.message ?? err.message ?? fallback;
}

function hasApiFieldError(error: unknown, field: string) {
  const err = error as AxiosError<ApiErrorResponse>;
  const errors = err.response?.data?.errors as Record<string, string[]> | undefined;

  return Boolean(errors?.[field]?.length);
}
