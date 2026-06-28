@echo off
echo ====================================================
echo   Hệ thống Giải tích phân Thông minh - Dev Mode
echo ====================================================
echo.
echo [1/4] Đang kiểm tra các thư viện Python cốt lõi...
python -m pip install fastapi uvicorn python-dotenv sympy numpy --quiet
echo     OK - Các thư viện Python đã sẵn sàng.
echo [2/4] Đang kiểm tra cấu hình Firebase cho .NET API...
if not exist "%~dp0api-dotnet\firebase-service-account.json" (
    echo [WARNING] file firebase-service-account.json chưa được cấu hình.
    echo           Một số tính năng liên quan đến tài khoản & lịch sử sẽ bị tắt.
) else (
    echo     OK - Đã tìm thấy chứng chỉ Firebase.
)
echo [3/4] Đang khởi chạy FastAPI AI Server (port 8000)...
start "FastAPI AI Server" cmd /k "cd /d %~dp0 && .venv\Scripts\activate 2>nul || echo Chay moi truong he thong && python main_fastapi.py --dev --port 8000"
timeout /t 2 /nobreak > nul
echo [4/4] Đang khởi chạy .NET Core Gateway API (port 5100)...
start "dotnet API Gateway" cmd /k "cd /d %~dp0api-dotnet && dotnet run --launch-profile http"
timeout /t 3 /nobreak > nul
echo [5/4] Đang khởi chạy React UI dev server (port 5173)...
start "React UI" cmd /k "cd /d %~dp0web-ui && npm run dev"
timeout /t 2 /nobreak > nul

echo.
echo ====================================================
echo   Các dịch vụ đang được khởi chạy trong nền:
echo   - FastAPI AI Server : http://localhost:8000 (Docs: /docs)
echo   - .NET API Gateway  : http://localhost:5100 (Swagger: /)
echo   - React Web UI      : http://localhost:5173
echo ====================================================
echo.
echo Nhấn phím bất kỳ để mở trình duyệt Web UI...
pause > nul
start http://localhost:5173
