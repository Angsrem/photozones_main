#!/bin/bash
# ===== Деплой ФотоЗона24 на VPS =====
# Запускать ЛОКАЛЬНО (на вашем компьютере), не на сервере
# 
# Использование:
#   ./deploy.sh user@server-ip
#   ./deploy.sh root@192.168.1.100
#
# Что делает:
#   1. Собирает проект локально (next build)
#   2. Загружает на сервер готовую сборку + код + public
#   3. На сервере: ставит зависимости, инициализирует БД, запускает через PM2

set -e

SERVER=${1:-"root@YOUR_SERVER_IP"}
REMOTE_DIR="/var/www/fotozona24"
PROJECT_DIR="/home/z/my-project"

echo "=== 1. Сборка проекта (локально) ==="
cd "$PROJECT_DIR"
bun run build
echo "✓ Сборка завершена"

echo "=== 2. Создание архива для передачи ==="
tar czf /tmp/fotozona24-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='upload' \
  --exclude='dev.log' \
  --exclude='gen-images.log' \
  --exclude='.next/cache' \
  .next/ \
  public/ \
  prisma/ \
  scripts/ \
  src/ \
  package.json \
  bun.lock \
  next.config.ts \
  tsconfig.json \
  postcss.config.mjs \
  components.json \
  eslint.config.mjs \
  .env \
  README.md
echo "✓ Архив создан: $(du -h /tmp/fotozona24-deploy.tar.gz | cut -f1)"

echo "=== 3. Загрузка на сервер ==="
ssh "$SERVER" "mkdir -p $REMOTE_DIR"
scp /tmp/fotozona24-deploy.tar.gz "$SERVER:/tmp/"
ssh "$SERVER" "cd $REMOTE_DIR && tar xzf /tmp/fotozona24-deploy.tar.gz"
echo "✓ Файлы загружены"

echo "=== 4. Установка Node.js и Bun на сервере ==="
ssh "$SERVER" 'bash -s' << 'REMOTE_SETUP'
set -e

# Проверяем, установлен ли Bun
if ! command -v bun &> /dev/null; then
  echo "Устанавливаю Bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun/bin"
  export PATH="$BUN_INSTALL:$PATH"
  echo 'export BUN_INSTALL="$HOME/.bun/bin"' >> ~/.bashrc
  echo 'export PATH="$BUN_INSTALL:$PATH"' >> ~/.bashrc
fi
export BUN_INSTALL="$HOME/.bun/bin"
export PATH="$BUN_INSTALL:$PATH"

# Swap-файл (если нет)
if ! swapon --show | grep -q swapfile; then
  echo "Создаю swap-файл 2ГБ..."
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "✓ Swap включён"
fi

# Зависимости (только production)
cd /var/www/fotozona24
bun install --production
echo "✓ Зависимости установлены"

# Prisma generate
bun run db:generate
echo "✓ Prisma client сгенерирован"

# Проверяем, есть ли БД
if [ ! -f "db/custom.db" ]; then
  echo "Инициализирую БД..."
  mkdir -p db
  bun run db:push
  bun run prisma/seed.ts
  echo "✓ БД инициализирована (SQLite + 48 фотозон + отзывы + заявки)"
fi

# PM2 (если не установлен)
if ! command -v pm2 &> /dev/null; then
  echo "Устанавливаю PM2..."
  npm install -g pm2
fi

# Останавливаем старый процесс
pm2 delete fotozona24 2>/dev/null || true

# Запускаем
cd /var/www/fotozona24
NODE_OPTIONS="--max-old-space-size=384" pm2 start "next start -p 3000" \
  --name fotozona24 \
  --max-memory-restart 450M \
  --env production
echo "✓ Сайт запущен через PM2"

# Сохраняем PM2 конфиг
pm2 save
pm2 startup 2>/dev/null || true

echo ""
echo "========================================="
echo "✅ САЙТ ЗАПУЩЕН!"
echo "========================================="
echo "URL: http://$(hostname -I | awk '{print $1}'):3000"
echo "Админка: http://$(hostname -I | awk '{print $1}'):3000/admin/login"
echo "Логин: admin@fotozona24.ru"
echo "========================================="
echo ""
echo "Команды PM2:"
echo "  pm2 status          — статус"
echo "  pm2 logs fotozona24  — логи"
echo "  pm2 restart fotozona24 — перезапуск"
echo "  pm2 stop fotozona24  — остановка"
echo ""

REMOTE_SETUP

echo "=== 5. Очистка ==="
rm /tmp/fotozona24-deploy.tar.gz
echo "✓ Деплой завершён!"
