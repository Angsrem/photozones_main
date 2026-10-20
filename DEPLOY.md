# Инструкция по деплою на VPS (RUVDS 149₽/мес)

## Что нужно

1. **VPS RUVDS Старт** (149₽/мес, 512МБ RAM, 10ГБ диск, Ubuntu)
2. **SSH доступ** к серверу (IP + пароль/ключ)
3. **Локальный компьютер** с установленным Bun

## Шаг 1. Купить VPS

1. Зайдите на https://ruvds.com
2. VPS Старт → 149₽/мес
3. ОС: Ubuntu 22.04 или 24.04
4. Получите IP-адрес и пароль root

## Шаг 2. Собрать и задеплоить

На вашем компьютере (в папке проекта):

```bash
# Дать права на скрипт
chmod +x deploy.sh

# Запустить деплой (замените на свой IP)
./deploy.sh root@ВАШ_IP_АДРЕС
```

Скрипт автоматически:
- Соберёт проект локально (`next build`)
- Загрузит на сервер
- Установит Bun, зависимости
- Создаст swap-файл 2ГБ
- Инициализирует БД (SQLite + 48 фотозон)
- Запустит через PM2 с лимитом 384МБ RAM

## Шаг 3. Проверить

Откройте в браузере:
```
http://ВАШ_IP:3000
```

Админка:
```
http://ВАШ_IP:3000/admin/login
admin@fotoarka.ru / admin123
```

## Шаг 4. Привязать домен (опционально)

Если есть домен (например, fotoarka.ru):

1. В DNS настройках домена добавьте A-запись:
   ```
   @   A   ВАШ_IP_АДРЕС
   www A   ВАШ_IP_АДРЕС
   ```

2. На сервере установите Nginx:
```bash
sudo apt install nginx
```

3. Создайте конфиг `/etc/nginx/sites-available/fotoarka`:
```nginx
server {
    listen 80;
    server_name fotoarka.ru www.fotoarka.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. Активируйте и получите SSL:
```bash
sudo ln -s /etc/nginx/sites-available/fotoarka /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d fotoarka.ru -d www.fotoarka.ru
```

## Управление на сервере

```bash
# Статус сайта
pm2 status

# Логи
pm2 logs fotoarka

# Перезапуск
pm2 restart fotoarka

# Остановка
pm2 stop fotoarka

# Проверить память
free -h

# Проверить диск
df -h
```

## Если несколько сайтов на одном VPS

Каждый сайт — на своём порту:

```bash
# Сайт 1 (Fotoarka)
NODE_OPTIONS="--max-old-space-size=256" pm2 start "next start -p 3000" --name fotoarka --max-memory-restart 300M

# Сайт 2 (другой проект)
NODE_OPTIONS="--max-old-space-size=256" pm2 start "next start -p 3001" --name site2 --max-memory-restart 300M
```

Nginx направляет по доменам:
```nginx
server {
    server_name fotoarka.ru;
    location / { proxy_pass http://127.0.0.1:3000; }
}
server {
    server_name site2.ru;
    location / { proxy_pass http://127.0.0.1:3001; }
}
```

512 МБ хватит на 2 лёгких сайта. 3+ — нужен апгрейд до 1 ГБ RAM.

## Если сайт упал (нехватка RAM)

```bash
# Проверить логи
pm2 logs fotoarka --lines 50

# Если видите "OOM" или "memory limit" — PM2 автоматически перезапустит
# Если не перезапустился:
pm2 restart fotoarka

# Если постоянно падает — нужен апгрейд:
# RUVDS → тариф с 1 ГБ RAM (~300₽/мес)
```

## Безопасность

После деплоя ОБЯЗАТЕЛЬНО:
1. Сменить пароль админки (через .env → ADMIN_PASSWORD)
2. Сменить ADMIN_JWT_SECRET (openssl rand -base64 48)
3. Закрыть порт 3000 извне (через Nginx — только 80/443)
