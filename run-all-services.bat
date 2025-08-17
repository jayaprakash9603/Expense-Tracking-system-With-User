@echo off
echo Starting all services...

REM Define paths
set "BASE_BACKEND=C:\Users\jayapraj\Downloads\Expense Tracking With User\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main"
set "FRONTEND_DIR=C:\Users\jayapraj\Downloads\Expense Tracking With User\Expense-Tracking-system-With-User\Expense Tracking System FrontEnd\social-media-master"

REM Check if Windows Terminal is available
where wt >nul 2>nul
if %errorlevel% neq 0 (
    echo Windows Terminal not found. Using separate CMD windows instead.
    goto :use_windows
)

REM Launch backend services in one Windows Terminal window with multiple tabs
echo Launching backend services in Windows Terminal...

start "" wt ^
new-tab --title "EurekaServer" cmd /k "cd /d \"%BASE_BACKEND%\eureka-server\" && mvn spring-boot:run" ^
new-tab --title "GatewayService" cmd /k "cd /d \"%BASE_BACKEND%\Gateway\" && mvn spring-boot:run" ^
new-tab --title "UserService" cmd /k "cd /d \"%BASE_BACKEND%\User-Service\" && mvn spring-boot:run" ^
new-tab --title "ExpenseTracking" cmd /k "cd /d \"%BASE_BACKEND%\social-media-app\" && mvn spring-boot:run" ^
new-tab --title "ChatService" cmd /k "cd /d \"%BASE_BACKEND%\Chat-Service\" && mvn spring-boot:run" ^
new-tab --title "PaymentService" cmd /k "cd /d \"%BASE_BACKEND%\Payment-method-Service\" && mvn spring-boot:run" ^
new-tab --title "CategoryService" cmd /k "cd /d \"%BASE_BACKEND%\Category-Service\" && mvn spring-boot:run" ^
new-tab --title "FriendShipService" cmd /k "cd /d \"%BASE_BACKEND%\FriendShip-Service\" && mvn spring-boot:run" ^
new-tab --title "BudgetService" cmd /k "cd /d \"%BASE_BACKEND%\Budget-Service\" && mvn spring-boot:run" ^
new-tab --title "BillService" cmd /k "cd /d \"%BASE_BACKEND%\Bill-Service\" && mvn spring-boot:run" ^
new-tab --title "AuditService" cmd /k "cd /d \"%BASE_BACKEND%\Audit-Service\" && mvn spring-boot:run"

REM Optional: Wait a bit before frontend
timeout /t 3 >nul

REM Launch frontend in separate tab
echo Launching frontend...
start "" wt new-tab --title "Frontend" cmd /k "cd /d \"%FRONTEND_DIR%\" && npm start"

exit

:use_windows
REM Fallback to separate CMD windows
echo Launching backend services in separate CMD windows...
start "EurekaServer" cmd /k "cd /d \"%BASE_BACKEND%\eureka-server\" && mvn spring-boot:run"
start "GatewayService" cmd /k "cd /d \"%BASE_BACKEND%\Gateway\" && mvn spring-boot:run"
start "UserService" cmd /k "cd /d \"%BASE_BACKEND%\User-Service\" && mvn spring-boot:run"
start "ExpenseTracking" cmd /k "cd /d \"%BASE_BACKEND%\social-media-app\" && mvn spring-boot:run"
start "ChatService" cmd /k "cd /d \"%BASE_BACKEND%\Chat-Service\" && mvn spring-boot:run"
start "PaymentService" cmd /k "cd /d \"%BASE_BACKEND%\Payment-method-Service\" && mvn spring-boot:run"
start "CategoryService" cmd /k "cd /d \"%BASE_BACKEND%\Category-Service\" && mvn spring-boot:run"
start "FriendShipService" cmd /k "cd /d \"%BASE_BACKEND%\FriendShip-Service\" && mvn spring-boot:run"
start "BudgetService" cmd /k "cd /d \"%BASE_BACKEND%\Budget-Service\" && mvn spring-boot:run"
start "BillService" cmd /k "cd /d \"%BASE_BACKEND%\Bill-Service\" && mvn spring-boot:run"
start "AuditService" cmd /k "cd /d \"%BASE_BACKEND%\Audit-Service\" && mvn spring-boot:run"

echo Launching frontend in separate CMD window...
start "Frontend" cmd /k "cd /d \"%FRONTEND_DIR%\" && npm start"

exit
