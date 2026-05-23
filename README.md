# Maison Perfume Shop

Maison perfume e-commerce platform built with React and Laravel.

## Tech Stack

Frontend:
- React, TypeScript, Vite
- TanStack Query, Axios
- Tailwind CSS, Shadcn UI

Backend:
- Laravel (Repository/Service pattern)
- MySQL, Sanctum (token-based auth)
- Queue (database driver)

## Prerequisites

- PHP >= 8.1, Composer
- Node.js >= 18, npm
- MySQL

## Getting Started

```bash
git clone https://github.com/naminc/maison-perfume-shop.git
cd maison-perfume-shop
```

### Backend

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Queue Worker (required for email)

Forgot password và các email khác được gửi qua queue. Cần chạy worker:

```bash
# Local development — mở terminal riêng
cd backend
php artisan queue:work
```

`.env` cần có:
```
QUEUE_CONNECTION=database
```

### Production (Supervisor)

Trên production, dùng Supervisor để queue worker chạy vĩnh viễn:

```bash
sudo apt install supervisor -y
```

Tạo file `/etc/supervisor/conf.d/maison-queue.conf`:

```ini
[program:maison-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www
numprocs=1
redirect_stderr=true
stdout_logfile=/path/to/backend/storage/logs/queue.log
stopwaitsecs=3600
```

Khởi động:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start maison-queue:*
sudo supervisorctl status          # Kiểm tra RUNNING
```

Sau mỗi lần deploy code mới:

```bash
sudo supervisorctl restart maison-queue:*
```

### Xem log queue

```bash
# Local
# Output hiện trực tiếp trên terminal queue:work

# Production
cat /path/to/backend/storage/logs/queue.log
```

## Environment Variables

### Backend (.env)

| Key | Description | Example |
|-----|-------------|---------|
| `APP_URL` | URL backend | `https://api.example.com` |
| `FRONTEND_URL` | URL frontend (dùng cho reset password link) | `https://example.com` |
| `DB_*` | MySQL connection | |
| `MAIL_*` | SMTP config | Gmail, Mailgun, Resend... |
| `QUEUE_CONNECTION` | Queue driver (`sync` hoặc `database`) | `database` |
| `SANCTUM_TOKEN_EXPIRATION` | Access token TTL (phút) | `15` |

### Frontend (.env)

| Key | Description | Example |
|-----|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |