#!/bin/bash
cd /home/z/my-project
while true; do
  echo "Starting Next.js server..."
  npx next start -p 3000 2>&1
  echo "Server stopped. Restarting in 2 seconds..."
  sleep 2
done
