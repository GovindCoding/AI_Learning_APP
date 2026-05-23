@echo off
setlocal enabledelayedexpansion
title AI Learning Tracker - Control Center
color 0B

:MENU
cls
echo ===================================================================
echo      ___   _   _                    _               ___
echo     / _ \ ^| ^| ^| ^|                  (_)             / _ \
echo    / /_\ \^| ^| ^| ^|  ___   __ _ _ __  _ _ __   __ _ / /_\ \_ __  _ __
echo    ^|  _  ^|^| ^| ^| ^| / _ \ / _` ^| '_ \^| ^| '_ \ / _` ^|^|  _  ^| '_ \^| '_ \
echo    ^| ^| ^| ^|^| ^| ^| ^|^|  __/^| (_^| ^| ^| ^| ^| ^| ^| ^| ^| ^| (_^| ^|^| ^| ^| ^| ^|_) ^| ^|_) ^|
echo    \_^| ^|_/\_/ \_/ \___^| \__,_^|_^| ^|_^|_^|_^| ^|_^|\__, ^|\_^| ^|_^| .__/^| .__/
echo                                              __/ ^|     ^| ^|   ^| ^|
echo                                             ^|___/      ^|_^|   ^|_^|
echo ===================================================================
echo    Microservices Orchestrator ^& Management Console
echo ===================================================================
echo.
echo  [1] Start Application (All Services ^& Frontend UI)
echo  [2] Initialize ^& Seed Database (MySQL)
echo  [3] Clean ^& Rebuild Backend Services (Maven)
echo  [4] Stop All Running Application Services
echo  [5] Exit
echo.
echo ===================================================================
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto START_APP
if "%choice%"=="2" goto INIT_DB
if "%choice%"=="3" goto BUILD_BACKEND
if "%choice%"=="4" goto STOP_SERVICES
if "%choice%"=="5" goto EXIT
goto MENU

:START_APP
echo.
echo [+] Checking if MySQL is running on port 3306...
netstat -ano | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo [WARNING] MySQL does not seem to be running on port 3306.
    echo Please make sure your MySQL service is started.
    pause
    goto MENU
)
echo [OK] MySQL is active.
echo.

echo [+] Stopping any existing services to prevent port conflicts...
call :KILL_PORT 8761
call :KILL_PORT 8080
call :KILL_PORT 8081
call :KILL_PORT 8082
call :KILL_PORT 8083
call :KILL_PORT 8084
call :KILL_PORT 5173

echo.
echo [+] Starting Discovery Server (Eureka) on port 8761...
start "AI App - Discovery Server" java -jar backend\discovery-server\target\discovery-server-1.0.0-SNAPSHOT.jar
echo Waiting 12 seconds for Discovery Server to start...
timeout /t 12 /nobreak >nul

echo [+] Starting Authentication Service on port 8081...
start "AI App - Auth Service" java -jar backend\auth-service\target\auth-service-1.0.0-SNAPSHOT.jar

echo [+] Starting Learning Service on port 8082...
start "AI App - Learning Service" java -jar backend\learning-service\target\learning-service-1.0.0-SNAPSHOT.jar

echo [+] Starting Tools ^& News Service on port 8083...
start "AI App - Tools ^& News Service" java -jar backend\tools-news-service\target\tools-news-service-1.0.0-SNAPSHOT.jar

echo Waiting 5 seconds before starting Gateway Service...
timeout /t 5 /nobreak >nul

echo [+] Starting Gateway Service on port 8080...
start "AI App - Gateway Service" java -jar backend\gateway-service\target\gateway-service-1.0.0-SNAPSHOT.jar

echo [+] Starting Social Image Service on port 8084...
start "AI App - Social Image Service" cmd /c "cd backend\social-image-service && node server.js"

echo Waiting 5 seconds before starting Frontend UI...
timeout /t 5 /nobreak >nul

echo [+] Starting Frontend UI (Vite) on port 5173...
start "AI App - Frontend UI" cmd /c "cd frontend && npm run dev"

echo.
echo ===================================================================
echo [SUCCESS] All services and app launched in separate windows!
echo - Discovery Dashboard: http://localhost:8761
echo - Gateway Server: http://localhost:8080
echo - Frontend Web UI: http://localhost:5173
echo ===================================================================
echo.
pause
goto MENU

:INIT_DB
echo.
echo [+] Initializing MySQL databases, schema, and seed data...
python database\init_db.py
if %errorlevel% neq 0 (
    echo [ERROR] Database initialization failed. Please check MySQL credentials and status.
    pause
    goto MENU
)
echo [+] Applying database migrations/deltas...
python database\apply_delta.py
if %errorlevel% neq 0 (
    echo [ERROR] Applying delta migrations failed.
    pause
    goto MENU
)
echo [SUCCESS] Database set up and seeded successfully!
pause
goto MENU

:BUILD_BACKEND
echo.
echo [+] Rebuilding backend microservices using Maven...
cd backend
call mvn clean package -DskipTests
cd ..
if %errorlevel% neq 0 (
    echo [ERROR] Maven build failed. Please resolve compilation issues.
    pause
    goto MENU
)
echo [SUCCESS] Backend microservices compiled and repackaged successfully!
pause
goto MENU

:STOP_SERVICES
echo.
echo [+] Stopping all running services...
call :KILL_PORT 8761
call :KILL_PORT 8080
call :KILL_PORT 8081
call :KILL_PORT 8082
call :KILL_PORT 8083
call :KILL_PORT 8084
call :KILL_PORT 5173
echo [SUCCESS] All application services stopped and ports freed.
pause
goto MENU

:EXIT
echo.
echo Thank you for using AI Learning Tracker. Goodbye!
timeout /t 2 /nobreak >nul
exit /b

:: Helper label to kill a process by port number
:KILL_PORT
set "PORT=%1"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":%PORT% " ^| findstr /i LISTENING') do (
    echo Killing process %%a running on port %PORT%...
    taskkill /f /pid %%a >nul 2>&1
)
goto :eof
