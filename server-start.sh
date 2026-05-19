#!/bin/bash
cd /home/z/my-project
export PORT=3000
export HOSTNAME=0.0.0.0
exec npx next start -p 3000 -H 0.0.0.0
