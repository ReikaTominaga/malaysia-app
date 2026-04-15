@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"

echo.
echo  Malaysia Travel App - Starting...
echo.

:: ---- Node.js ----
where node >nul 2>&1
if %ERRORLEVEL% == 0 (
  echo  [Node.js] Starting server...
  start "Malaysia App" cmd /k "cd /d "%~dp0" && node server.js"
  timeout /t 2 >nul
  start http://localhost:8080
  goto :eof
)

:: ---- Python (real, not MS Store stub) ----
python -c "import sys; sys.exit(0 if sys.version_info.major==3 else 1)" >nul 2>&1
if %ERRORLEVEL% == 0 (
  echo  [Python] Starting server...
  start "Malaysia App" cmd /k "cd /d "%~dp0" && python -m http.server 8080"
  timeout /t 2 >nul
  start http://localhost:8080
  goto :eof
)

:: ---- PowerShell (built-in to all Windows) ----
echo  [PowerShell] Starting server...
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
goto :eof
