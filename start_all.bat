@echo off
echo ===================================================
echo   Starting AI Learning App Services (Direct Run)
echo ===================================================
echo.
echo [+] Killing any stale processes on our ports...
for %%p in (8761 8080 8081 8082 8083 8084 5173) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo Killing process %%a on port %%p...
        taskkill /f /pid %%a >nul 2>&1
    )
)

echo.
echo [+] Starting Discovery Server (Eureka) on port 8761...
start "Eureka" java -jar backend\discovery-server\target\discovery-server-1.0.0-SNAPSHOT.jar
echo Waiting 12 seconds for Eureka...
ping 127.0.0.1 -n 13 >nul

echo.
echo [+] Starting Authentication Service on port 8081...
start "Auth" java -jar backend\auth-service\target\auth-service-1.0.0-SNAPSHOT.jar

echo [+] Starting Learning Service on port 8082...
start "Learning" java -jar backend\learning-service\target\learning-service-1.0.0-SNAPSHOT.jar

echo [+] Starting Tools and News Service on port 8083...
start "ToolsNews" java -jar backend\tools-news-service\target\tools-news-service-1.0.0-SNAPSHOT.jar

echo Waiting 6 seconds for services...
ping 127.0.0.1 -n 7 >nul

echo.
echo [+] Starting Gateway Service on port 8080...
start "Gateway" java -jar backend\gateway-service\target\gateway-service-1.0.0-SNAPSHOT.jar

echo [+] Starting Social Image Service on port 8084...
start "SocialImage" cmd /c "cd backend\social-image-service && node server.js"

echo Waiting 5 seconds...
ping 127.0.0.1 -n 6 >nul

echo.
echo [+] Starting Frontend UI (Vite) on port 5173...
start "Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ===================================================
echo [SUCCESS] All services started successfully!
echo Keeping launcher script alive to maintain background windows...
echo ===================================================

:loop
ping 127.0.0.1 -n 10 >nul
goto loop
