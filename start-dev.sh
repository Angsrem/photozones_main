#!/bin/bash
# Watchdog для dev-сервера — перезапускает при падении
# webpack вместо Turbopack (меньше RAM, без OOM)
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=768"
while true; do
  echo "[$(date)] starting next dev (webpack, max 768MB)..."
  node_modules/.bin/next dev -p 3000 --webpack >> /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] next dev exited with code $EXIT_CODE, restarting in 3s..."
  sleep 3
done
