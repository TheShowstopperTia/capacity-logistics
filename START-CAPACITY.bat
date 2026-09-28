@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Please install Node.js LTS from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)
echo Installing CAPACITY dependencies...
call npm install
if errorlevel 1 (
  echo.
  echo Dependency installation failed. Please send me this window's error message.
  pause
  exit /b 1
)
echo.
echo Starting CAPACITY...
call npm run dev
pause
