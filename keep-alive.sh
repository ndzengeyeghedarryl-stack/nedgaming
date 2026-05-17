#!/bin/bash
while true; do
  cd /home/z/my-project
  echo "[$(date)] Starting server..."
  node .next/standalone/server.js -H 0.0.0.0 -p 3000 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE"
  sleep 2
done
