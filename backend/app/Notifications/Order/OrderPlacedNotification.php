<?php

namespace App\Notifications\Order;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPlacedNotification extends Notification implements ShouldQueue
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

        return (new MailMessage)
            ->subject("Maison đã nhận đơn hàng #{$order->order_code}")
            ->view('emails.orders.placed', [
                'order' => $order,
                'orderUrl' => $this->orderUrl($order),
            ]);
    }

    private function orderUrl(Order $order): string
    {
        $frontendUrl = rtrim((string) config('app.frontend_url', 'http://localhost:8080'), '/');

        return "{$frontendUrl}/account/orders/{$order->order_code}";
    }
}
