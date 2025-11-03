@echo off
echo Restarting Budget Service...

set "BUDGET_SERVICE=C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\Budget-Service"

echo.
echo Please stop the currently running Budget Service (Ctrl+C in its window)
echo Press any key after stopping the service...
pause

echo.
echo Starting Budget Service...
cd /d "%BUDGET_SERVICE%"
mvn spring-boot:run
