@echo off
echo Starting all services in separate tabs...

REM Set path to your React frontend directory
set "FRONTEND_DIR=C:\Users\jayapraj\Downloads\Expense Tracking With User\Expense-Tracking-system-With-User\Expense Tracking System FrontEnd\social-media-master"

REM Check if Windows Terminal is available
where wt >nul 2>nul
if %errorlevel% neq 0 (
    echo Windows Terminal not found. Using separate windows instead.
    goto :use_windows
)

REM Use Windows Terminal with a new tab
echo Launching in Windows Terminal...
wt new-tab --title "Frontend" cmd /k "cd /d \"%FRONTEND_DIR%\" && npm start"
goto :end

:use_windows
REM Fallback to separate Command Prompt window
echo Launching in Command Prompt window...
start "Frontend" cmd /k "cd /d \"%FRONTEND_DIR%\" && npm start"
goto :end

:end
echo All services launched!
pause
