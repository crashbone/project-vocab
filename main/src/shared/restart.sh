#!/bin/bash
sleep 5
echo "Killing existing Python processes..."
# Kill all python3 processes except the one with the PID passed as argument $1
pgrep -f python | grep -v "$1" | xargs kill -9

echo "Starting Backend..."
cd "$(dirname "$0")/.."
nohup python3 -m backend > output.log 2>&1 &
disown
exit