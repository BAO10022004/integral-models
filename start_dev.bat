@echo off
echo ============================================
echo   Integral Model Tester - Dev Environment
echo ============================================
echo.

:: Install Python deps
echo [1/3] Checking Python dependencies...
python -m pip install flask flask-cors --quiet
echo     OK

:: Start Flask API in background
echo [2/3] Starting Flask API (port 5000)...
start "Flask API" cmd /k "cd /d %~dp0 && python -m ai.api"
timeout /t 2 /nobreak > nul

:: Start Vite in background  
echo [3/3] Starting React dev server (port 5173)...
start "React UI" cmd /k "cd /d %~dp0\web-ui && npm run dev"
timeout /t 2 /nobreak > nul

echo.
echo ============================================
echo   Servers starting...
echo   Flask API : http://localhost:5000
echo   Web UI    : http://localhost:5173
echo ============================================
echo.
echo Nhan phim bat ky de mo browser...
pause > nul
start http://localhost:5173
