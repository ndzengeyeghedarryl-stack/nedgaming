#!/bin/bash
# NedGaming Server Startup Script
cd /home/z/my-project

# Kill any existing server
pkill -f "next dev" 2>/dev/null
pkill -f "next start" 2>/dev/null
pkill -f "server.js" 2>/dev/null
sleep 2

# Start the server
echo "Starting NedGaming server..."
npx next dev -p 3000 -H 0.0.0.0 &
sleep 3
echo "Server started at http://localhost:3000"
echo "Press Ctrl+C to stop"
wait
