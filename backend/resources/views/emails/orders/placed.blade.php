@php
    $money = fn ($value) => number_format((float) $value, 0, ',', '.') . ' đ';
    $date = optional($order->created_at)->timezone(config('app.timezone'))->format('H:i d/m/Y');
    $address = implode(', ', array_filter([
        $order->shipping_address,
        $order->ward_name,
        $order->province_name,
    ]));
@endphp
<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Maison đã nhận đơn hàng #{{ $order->order_code }}</title>
</head>
<body style="margin:0;background:#f5f1eb;color:#1c1917;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Maison đã nhận đơn hàng #{{ $order->order_code }} của bạn.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f1eb;margin:0;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;">
                    <tr>
                        <td align="center" style="padding:10px 0 24px;">
                            <div style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:999px;background:#1c1917;color:#ffffff;font-size:20px;font-weight:700;text-align:center;">M</div>
                            <div style="margin-top:10px;font-size:18px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#1c1917;">Maison</div>
                            <div style="margin-top:4px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#a16207;">Perfume</div>
                        </td>
                    </tr>

                    <tr>
                        <td style="overflow:hidden;border:1px solid #e7e5e4;border-radius:18px;background:#ffffff;box-shadow:0 18px 45px rgba(28,25,23,0.08);">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="background:#1c1917;padding:28px 32px;text-align:center;">
                                        <div style="font-size:22px;font-weight:700;color:#ffffff;">Maison đã nhận đơn hàng</div>
                                        <div style="margin-top:8px;font-size:14px;line-height:22px;color:#d6d3d1;">Mã đơn #{{ $order->order_code }} · {{ $date }}</div>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:30px 32px;">
                                        <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1c1917;">Xin chào {{ $order->customer_name }},</p>
                                        <p style="margin:0 0 22px;font-size:15px;line-height:24px;color:#57534e;">
                                            Cảm ơn bạn đã đặt hàng tại Maison. Chúng tôi sẽ kiểm tra và liên hệ xác nhận trước khi giao.
                                        </p>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 22px;">
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e7e5e4;font-size:12px;font-weight:700;color:#78716c;text-transform:uppercase;">Sản phẩm</td>
                                                <td align="right" style="padding:10px 0;border-bottom:1px solid #e7e5e4;font-size:12px;font-weight:700;color:#78716c;text-transform:uppercase;">Thành tiền</td>
                                            </tr>
                                            @foreach ($order->items as $item)
                                                <tr>
                                                    <td style="padding:14px 0;border-bottom:1px solid #f5f5f4;">
                                                        <div style="font-size:14px;font-weight:700;color:#1c1917;">{{ $item->product_name }}</div>
                                                        <div style="margin-top:4px;font-size:12px;color:#78716c;">
                                                            {{ collect([$item->brand_name, $item->volume_ml ? $item->volume_ml . 'ml' : null, $item->concentration])->filter()->join(' · ') }} · x{{ $item->quantity }}
                                                        </div>
                                                    </td>
                                                    <td align="right" style="padding:14px 0;border-bottom:1px solid #f5f5f4;font-size:14px;font-weight:700;color:#1c1917;">{{ $money($item->line_total) }}</td>
                                                </tr>
                                            @endforeach
                                        </table>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;">
                                            <tr>
                                                <td style="padding:5px 0;font-size:14px;color:#57534e;">Tạm tính</td>
                                                <td align="right" style="padding:5px 0;font-size:14px;color:#1c1917;">{{ $money($order->subtotal) }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:5px 0;font-size:14px;color:#57534e;">Phí vận chuyển</td>
                                                <td align="right" style="padding:5px 0;font-size:14px;color:#1c1917;">{{ (float) $order->shipping_fee === 0.0 ? 'Miễn phí' : $money($order->shipping_fee) }}</td>
                                            </tr>
                                            @if ((float) $order->discount_total > 0)
                                                <tr>
                                                    <td style="padding:5px 0;font-size:14px;color:#57534e;">Giảm giá</td>
                                                    <td align="right" style="padding:5px 0;font-size:14px;color:#047857;">-{{ $money($order->discount_total) }}</td>
                                                </tr>
                                            @endif
                                            <tr>
                                                <td style="padding:12px 0 0;border-top:1px solid #e7e5e4;font-size:16px;font-weight:700;color:#1c1917;">Tổng thanh toán</td>
                                                <td align="right" style="padding:12px 0 0;border-top:1px solid #e7e5e4;font-size:18px;font-weight:700;color:#92400e;">{{ $money($order->total) }}</td>
                                            </tr>
                                        </table>

                                        <div style="border-radius:14px;background:#fafaf9;padding:16px 18px;border:1px solid #e7e5e4;margin-bottom:24px;">
                                            <p style="margin:0 0 8px;font-size:13px;line-height:21px;color:#57534e;"><strong style="color:#1c1917;">Thanh toán:</strong> COD - thanh toán khi nhận hàng.</p>
                                            <p style="margin:0;font-size:13px;line-height:21px;color:#57534e;"><strong style="color:#1c1917;">Địa chỉ:</strong> {{ $address }}</p>
                                        </div>

                                        <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto;">
                                            <tr>
                                                <td align="center" style="border-radius:12px;background:#1c1917;">
                                                    <a href="{{ $orderUrl }}" style="display:inline-block;padding:14px 28px;border-radius:12px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Xem đơn hàng</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:22px 12px 0;">
                            <p style="margin:0;font-size:12px;line-height:20px;color:#78716c;">Maison Perfume Shop<br>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
