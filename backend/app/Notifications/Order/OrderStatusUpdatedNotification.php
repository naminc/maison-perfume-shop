<?php

namespace App\Notifications\Order;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Order $order,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $order = $this->order->loadMissing(['items', 'user:id,full_name,email,phone']);
        $statusLabel = $this->statusLabel($this->statusValue($order));

        return (new MailMessage)
            ->subject("Cập nhật đơn hàng #{$order->order_code}: {$statusLabel}")
            ->view('emails.orders.status-updated', [
                'order' => $order,
                'statusLabel' => $statusLabel,
                'statusDescription' => $this->statusDescription($this->statusValue($order)),
                'orderUrl' => $this->orderUrl($order),
            ]);
    }

    private function orderUrl(Order $order): string
    {
        $frontendUrl = rtrim((string) config('app.frontend_url', 'http://localhost:8080'), '/');

        return "{$frontendUrl}/account/orders/{$order->order_code}";
    }

    private function statusValue(Order $order): string
    {
        return $order->status instanceof \BackedEnum
            ? (string) $order->status->value
            : (string) $order->status;
    }

    private function statusLabel(string $status): string
    {
        return [
            'pending' => 'Chờ xử lý',
            'confirmed' => 'Đã xác nhận',
            'processing' => 'Đang chuẩn bị',
            'shipping' => 'Đang giao',
            'completed' => 'Hoàn thành',
            'cancelled' => 'Đã huỷ',
        ][$status] ?? 'Đã cập nhật';
    }

    private function statusDescription(string $status): string
    {
        return [
            'confirmed' => 'Đơn hàng của bạn đã được Maison xác nhận và sẽ sớm được chuẩn bị.',
            'processing' => 'Đơn hàng đang được chuẩn bị và đóng gói cẩn thận.',
            'shipping' => 'Đơn hàng đang trên đường giao tới địa chỉ nhận hàng.',
            'completed' => 'Đơn hàng đã hoàn thành. Với COD, trạng thái thanh toán đã được ghi nhận là đã thanh toán.',
            'cancelled' => 'Đơn hàng đã được huỷ. Nếu có vấn đề cần hỗ trợ, Maison sẽ liên hệ thêm khi cần.',
        ][$status] ?? 'Đơn hàng của bạn vừa được cập nhật trạng thái.';
    }
}
