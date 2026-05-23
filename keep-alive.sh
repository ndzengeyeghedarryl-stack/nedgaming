#!/bin/bash
cd /home/z/my-project
LOG="/tmp/nextjs-server.log"
echo "Starting NedGaming keep-alive server..." > "$LOG"
while true; do
  node node_modules/.bin/next start -p 3000 >> "$LOG" 2>&1
  echo "Server crashed at $(date). Restarting in 2s..." >> "$LOG"
  sleep 2
done
