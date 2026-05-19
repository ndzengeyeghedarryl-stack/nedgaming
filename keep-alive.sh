#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev -p 3000 -H 0.0.0.0 2>&1 | tee -a dev.log
  echo "Server crashed at $(date), restarting in 3s..." >> dev.log
  sleep 3
done
