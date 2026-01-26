@echo off
echo Starting all services in separate tabs...

REM Get the current project directory (where this batch file is located)
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo Project Directory: %PROJECT_DIR%

REM Define relative paths to services
set "BACKEND_BASE=%PROJECT_DIR%\Expense-tracking-System-backend\Expense-tracking-backend-main"
set "FRONTEND_BASE=%PROJECT_DIR%\Expense Tracking System FrontEnd\social-media-master"

REM Check if Windows Terminal is available
where wt >nul 2>nul
if %errorlevel% neq 0 (
    echo Windows Terminal not found. Using separate windows instead.
    goto :use_windows
)

REM Use Windows Terminal with separate tabs
wt new-tab --title "EurekaServer" cmd /k "cd /d \"%BACKEND_BASE%\eureka-server\" && mvn spring-boot:run" ^
; new-tab --title "GatewayService" cmd /k "cd /d \"%BACKEND_BASE%\Gateway\" && mvn spring-boot:run" ^
; new-tab --title "UserService" cmd /k "cd /d \"%BACKEND_BASE%\User-Service\" && mvn spring-boot:run" ^
; new-tab --title "ExpenseTracking" cmd /k "cd /d \"%BACKEND_BASE%\social-media-app\" && mvn spring-boot:run" ^
; new-tab --title "ChatService" cmd /k "cd /d \"%BACKEND_BASE%\Chat-Service\" && mvn spring-boot:run" ^
; new-tab --title "PaymentService" cmd /k "cd /d \"%BACKEND_BASE%\Payment-method-Service\" && mvn spring-boot:run" ^
; new-tab --title "CategoryService" cmd /k "cd /d \"%BACKEND_BASE%\Category-Service\" && mvn spring-boot:run" ^
; new-tab --title "FriendShipService" cmd /k "cd /d \"%BACKEND_BASE%\FriendShip-Service\" && mvn spring-boot:run" ^
; new-tab --title "BudgetService" cmd /k "cd /d \"%BACKEND_BASE%\Budget-Service\" && mvn spring-boot:run" ^
; new-tab --title "BillService" cmd /k "cd /d \"%BACKEND_BASE%\Bill-Service\" && mvn spring-boot:run" ^
; new-tab --title "NotificationService" cmd /k "cd /d \"%BACKEND_BASE%\Notification-Service\" && mvn spring-boot:run" ^
; new-tab --title "AuditService" cmd /k "cd /d \"%BACKEND_BASE%\Audit-Service\" && mvn spring-boot:run" ^
; new-tab --title "AnalyticsService" cmd /k "cd /d \"%BACKEND_BASE%\AnalyticsService\" && mvn spring-boot:run" ^
; new-tab --title "EventService" cmd /k "cd /d \"%BACKEND_BASE%\Event-Service\" && mvn spring-boot:run" ^
; new-tab --title "SearchService" cmd /k "cd /d \"%BACKEND_BASE%\Search-Service\" && mvn spring-boot:run" ^
; new-tab --title "Frontend" cmd /k "cd /d \"%FRONTEND_BASE%\" && npm start"

echo All services launched in separate tabs!
goto :end

:use_windows
REM Fallback to separate windows if Windows Terminal is not available
start "EurekaServer" cmd /k "cd /d \"%BACKEND_BASE%\eureka-server\" && mvn spring-boot:run"
start "GatewayService" cmd /k "cd /d \"%BACKEND_BASE%\Gateway\" && mvn spring-boot:run"
start "UserService" cmd /k "cd /d \"%BACKEND_BASE%\User-Service\" && mvn spring-boot:run"
start "ExpenseTracking" cmd /k "cd /d \"%BACKEND_BASE%\social-media-app\" && mvn spring-boot:run"
start "ChatService" cmd /k "cd /d \"%BACKEND_BASE%\Chat-Service\" && mvn spring-boot:run"
start "PaymentService" cmd /k "cd /d \"%BACKEND_BASE%\Payment-method-Service\" && mvn spring-boot:run"
start "CategoryService" cmd /k "cd /d \"%BACKEND_BASE%\Category-Service\" && mvn spring-boot:run"
start "FriendShipService" cmd /k "cd /d \"%BACKEND_BASE%\FriendShip-Service\" && mvn spring-boot:run"
start "BudgetService" cmd /k "cd /d \"%BACKEND_BASE%\Budget-Service\" && mvn spring-boot:run"
start "BillService" cmd /k "cd /d \"%BACKEND_BASE%\Bill-Service\" && mvn spring-boot:run"
start "NotificationService" cmd /k "cd /d \"%BACKEND_BASE%\Notification-Service\" && mvn spring-boot:run"
start "AuditService" cmd /k "cd /d \"%BACKEND_BASE%\Audit-Service\" && mvn spring-boot:run"
start "AnalyticsService" cmd /k "cd /d \"%BACKEND_BASE%\Analytics-Service\" && mvn spring-boot:run"
start "EventService" cmd /k "cd /d \"%BACKEND_BASE%\Event-Service\" && mvn spring-boot:run"
start "SearchService" cmd /k "cd /d \"%BACKEND_BASE%\Search-Service\" && mvn spring-boot:run"
start "Frontend" cmd /k "cd /d \"%FRONTEND_BASE%\" && npm start"
echo All services launched in separate windows!

:end
pause