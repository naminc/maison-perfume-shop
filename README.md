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

Emails (forgot password, etc.) are dispatched via queue. A worker must be running to process them:

```bash
# Local development — open a separate terminal
cd backend
php artisan queue:work
```

Make sure `.env` has:
```
QUEUE_CONNECTION=database
```

### Production (Supervisor)

On production, use Supervisor to keep the queue worker running permanently:

```bash
sudo apt install supervisor -y
```

Create `/etc/supervisor/conf.d/maison-queue.conf`:

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

Start the worker:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start maison-queue:*
sudo supervisorctl status          # Should show RUNNING
```

After each deployment:

```bash
cd /path/to/backend
php artisan optimize:clear
php artisan optimize
sudo supervisorctl restart maison-queue:*
```

### Queue Logs

```bash
# Local — output is shown directly in the queue:work terminal

# Production
cat /path/to/backend/storage/logs/queue.log
```

## Environment Variables

### Backend (.env)

| Key | Description | Example |
|-----|-------------|---------|
| `APP_URL` | Backend URL | `https://api.example.com` |
| `FRONTEND_URL` | Frontend URL (used for reset password links) | `https://example.com` |
| `DB_*` | MySQL connection | |
| `MAIL_*` | SMTP configuration | Gmail, Mailgun, Resend... |
| `QUEUE_CONNECTION` | Queue driver (`sync` or `database`) | `database` |
| `SANCTUM_TOKEN_EXPIRATION` | Access token TTL (minutes) | `15` |

### Frontend (.env)

| Key | Description | Example |
|-----|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |
