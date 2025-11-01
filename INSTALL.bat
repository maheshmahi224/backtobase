@echo off
echo ========================================
echo Back To Base - Installation Script
echo ========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo [2/4] Installing Frontend Dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo [3/4] Setting up environment files...
cd ..
if not exist "server\.env" (
    copy "server\.env.example" "server\.env"
    echo Created server\.env file
) else (
    echo server\.env already exists
)

if not exist "client\.env" (
    copy "client\.env.example" "client\.env"
    echo Created client\.env file
) else (
    echo client\.env already exists
)
echo.

echo [4/4] Installation Complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Configure server\.env with your credentials
echo    - MongoDB URI
echo    - JWT Secret
echo    - Gmail OAuth credentials
echo.
echo 2. Start the backend:
echo    cd server
echo    npm run dev
echo.
echo 3. Start the frontend (in new terminal):
echo    cd client
echo    npm start
echo.
echo 4. Open http://localhost:3000
echo.
echo For detailed setup instructions, see QUICKSTART.md
echo ========================================
pause
