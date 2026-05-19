#!/bin/bash
cd /home/z/my-project
while true; do
  npx next start -p 3000 -H 0.0.0.0 2>&1
  echo "Server died, restarting in 2s..." >&2
  sleep 2
done
