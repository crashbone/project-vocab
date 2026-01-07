@echo off
echo Waiting for Python to release resources...
timeout /t 5 /nobreak > nul

echo Killing existing Python processes...
taskkill /F /IM python.exe /FI "PID ne %1"

echo Starting Backend...
cd /d "%~dp0.."
start "" python -m backend
exit