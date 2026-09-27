@echo off
echo Starting all microservices in separate tabs (local Maven, not Docker)...

set "BACKEND_DIR=%~dp0"
set "BACKEND_DIR=%BACKEND_DIR:~0,-1%"
set "FRONTEND_DIR=%BACKEND_DIR%\..\expense-tracking-frontend"

echo Backend:  %BACKEND_DIR%
echo Frontend: %FRONTEND_DIR%

where wt >nul 2>nul
if %errorlevel% neq 0 (
    echo Windows Terminal not found. Using separate windows instead.
    goto :use_windows
)

wt new-tab --title "EurekaServer" cmd /k "cd /d \"%BACKEND_DIR%\eureka-server\" && mvn spring-boot:run" ^
; new-tab --title "GatewayService" cmd /k "cd /d \"%BACKEND_DIR%\Gateway\" && mvn spring-boot:run" ^
; new-tab --title "UserService" cmd /k "cd /d \"%BACKEND_DIR%\user-service\" && mvn spring-boot:run" ^
; new-tab --title "ExpenseService" cmd /k "cd /d \"%BACKEND_DIR%\Expense-Service\" && mvn spring-boot:run" ^
; new-tab --title "ChatService" cmd /k "cd /d \"%BACKEND_DIR%\Chat-Service\" && mvn spring-boot:run" ^
; new-tab --title "PaymentService" cmd /k "cd /d \"%BACKEND_DIR%\Payment-method-Service\" && mvn spring-boot:run" ^
; new-tab --title "CategoryService" cmd /k "cd /d \"%BACKEND_DIR%\Category-Service\" && mvn spring-boot:run" ^
; new-tab --title "FriendShipService" cmd /k "cd /d \"%BACKEND_DIR%\FriendShip-Service\" && mvn spring-boot:run" ^
; new-tab --title "BudgetService" cmd /k "cd /d \"%BACKEND_DIR%\Budget-Service\" && mvn spring-boot:run" ^
; new-tab --title "BillService" cmd /k "cd /d \"%BACKEND_DIR%\Bill-Service\" && mvn spring-boot:run" ^
; new-tab --title "NotificationService" cmd /k "cd /d \"%BACKEND_DIR%\Notification-Service\" && mvn spring-boot:run" ^
; new-tab --title "AuditService" cmd /k "cd /d \"%BACKEND_DIR%\Audit-Service\" && mvn spring-boot:run" ^
; new-tab --title "AnalyticsService" cmd /k "cd /d \"%BACKEND_DIR%\AnalyticsService\" && mvn spring-boot:run" ^
; new-tab --title "EventService" cmd /k "cd /d \"%BACKEND_DIR%\Event-Service\" && mvn spring-boot:run" ^
; new-tab --title "SearchService" cmd /k "cd /d \"%BACKEND_DIR%\Search-Service\" && mvn spring-boot:run" ^
; new-tab --title "StoryService" cmd /k "cd /d \"%BACKEND_DIR%\Story-Service\" && mvn spring-boot:run" ^
; new-tab --title "Frontend" cmd /k "cd /d \"%FRONTEND_DIR%\" && npm start"

echo All services launched in separate tabs!
goto :end

:use_windows
start "EurekaServer" cmd /k "cd /d \"%BACKEND_DIR%\eureka-server\" && mvn spring-boot:run"
start "GatewayService" cmd /k "cd /d \"%BACKEND_DIR%\Gateway\" && mvn spring-boot:run"
start "UserService" cmd /k "cd /d \"%BACKEND_DIR%\user-service\" && mvn spring-boot:run"
start "ExpenseService" cmd /k "cd /d \"%BACKEND_DIR%\Expense-Service\" && mvn spring-boot:run"
start "ChatService" cmd /k "cd /d \"%BACKEND_DIR%\Chat-Service\" && mvn spring-boot:run"
start "PaymentService" cmd /k "cd /d \"%BACKEND_DIR%\Payment-method-Service\" && mvn spring-boot:run"
start "CategoryService" cmd /k "cd /d \"%BACKEND_DIR%\Category-Service\" && mvn spring-boot:run"
start "FriendShipService" cmd /k "cd /d \"%BACKEND_DIR%\FriendShip-Service\" && mvn spring-boot:run"
start "BudgetService" cmd /k "cd /d \"%BACKEND_DIR%\Budget-Service\" && mvn spring-boot:run"
start "BillService" cmd /k "cd /d \"%BACKEND_DIR%\Bill-Service\" && mvn spring-boot:run"
start "NotificationService" cmd /k "cd /d \"%BACKEND_DIR%\Notification-Service\" && mvn spring-boot:run"
start "AuditService" cmd /k "cd /d \"%BACKEND_DIR%\Audit-Service\" && mvn spring-boot:run"
start "AnalyticsService" cmd /k "cd /d \"%BACKEND_DIR%\AnalyticsService\" && mvn spring-boot:run"
start "EventService" cmd /k "cd /d \"%BACKEND_DIR%\Event-Service\" && mvn spring-boot:run"
start "SearchService" cmd /k "cd /d \"%BACKEND_DIR%\Search-Service\" && mvn spring-boot:run"
start "StoryService" cmd /k "cd /d \"%BACKEND_DIR%\Story-Service\" && mvn spring-boot:run"
start "Frontend" cmd /k "cd /d \"%FRONTEND_DIR%\" && npm start"
echo All services launched in separate windows!

:end
pause
