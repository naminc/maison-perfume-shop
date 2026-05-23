<?php

namespace App\Notifications\Auth;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    public function __construct(
        private readonly string $token,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $email = $notifiable->getEmailForPasswordReset();
        $url = $this->resetUrl($email);
        $expiresIn = config('auth.passwords.users.expire', 15);

        return (new MailMessage)
            ->subject('Đặt lại mật khẩu Maison')
            ->view('emails.auth.reset-password', [
                'resetUrl' => $url,
                'email' => $email,
                'expiresIn' => $expiresIn,
            ]);
    }

    private function resetUrl(string $email): string
    {
        $frontendUrl = rtrim((string) config('app.frontend_url', 'http://localhost:5173'), '/');
        $query = http_build_query([
            'token' => $this->token,
            'email' => $email,
        ]);

        return "{$frontendUrl}/auth/reset-password?{$query}";
    }
}
