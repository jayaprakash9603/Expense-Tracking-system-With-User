@echo off
echo Starting all services in separate tabs...

REM Check if Windows Terminal is available
where wt >nul 2>nul
if %errorlevel% neq 0 (
    echo Windows Terminal not found. Using separate windows instead.
    goto :use_windows
)

REM Use Windows Terminal with separate tabs
wt new-tab --title "EurekaServer" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\eureka-server && mvn spring-boot:run" ^
; new-tab --title "GatewayService" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\Gateway && mvn spring-boot:run" ^
; new-tab --title "UserService" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\User-Service && mvn spring-boot:run" ^
; new-tab --title "ExpenseTracking" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\social-media-app && mvn spring-boot:run" ^
; new-tab --title "ChatService" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\Chat-Service && mvn spring-boot:run" ^
; new-tab --title "PaymentService" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\Payment-method-Service && mvn spring-boot:run" ^
; new-tab --title "CategoryService" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\Category-Service && mvn spring-boot:run" ^
; new-tab --title "FriendShipService" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\FriendShip-Service && mvn spring-boot:run" ^
; new-tab --title "BudgetService" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\Budget-Service && mvn spring-boot:run" ^
; new-tab --title "BillService" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\Bill-Service && mvn spring-boot:run" ^
; new-tab --title "NotificationServicess" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\Notification-Service && mvn spring-boot:run" ^
; new-tab --title "AuditService" cmd /k "cd /d C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense-tracking-System-backend\Expense-tracking-backend-main\Audit-Service && mvn spring-boot:run" ^

; new-tab --title "Frontend" cmd /k "cd /d \"C:\Users\jayapraj\Downloads\Expense-Tracking-system-With-User\Expense Tracking System FrontEnd\social-media-master\" && npm start"

echo All services launched in separate tabs!
goto :end

:use_windows
REM Fallback to separate windows if Windows Terminal is not available
start "EurekaServer" cmd /k "cd /d Expense-tracking-System-backend\Expense-tracking-backend-main\eureka-server && mvn spring-boot:run"
start "GatewayService" cmd /k "cd /d Expense-tracking-System-backend\Expense-tracking-backend-main\Gateway && mvn spring-boot:run"
start "UserService" cmd /k "cd /d Expense-tracking-System-backend\Expense-tracking-backend-main\User-Service && mvn spring-boot:run"
start "ExpenseTracking" cmd /k "cd /d Expense-tracking-System-backend\Expense-tracking-backend-main\social-media-app && mvn spring-boot:run"
start "ChatService" cmd /k "cd /d Expense-tracking-System-backend\Expense-tracking-backend-main\Chat-Service && mvn spring-boot:run"
start "PaymentService" cmd /k "cd /d Expense-tracking-System-backend\Expense-tracking-backend-main\Payment-method-Service && mvn spring-boot:run"
start "CategoryService" cmd /k "cd /d Expense-tracking-System-backend\Expense-tracking-backend-main\Category-Service && mvn spring-boot:run"
start "FriendShipService" cmd /k "cd /d Expense-tracking-System-backend\Expense-tracking-backend-main\FriendShip-Service && mvn spring-boot:run"
start "BudgetService" cmd /k "cd /d Expense-tracking-System-backend\Expense-tracking-backend-main\Budget-Service && mvn spring-boot:run"
start "BillService" cmd /k "cd /d Expense-tracking-System-backend\Expense-tracking-backend-main\Bill-Service && mvn spring-boot:run"
start "AuditService" cmd /k "cd /d Expense-tracking-System-backend\Expense-tracking-backend-main\Audit-Service && mvn spring-boot:run"
start "Frontend" cmd /k "cd /d Expense Tracking System FrontEnd\social-media-master && npm start"
echo All services launched in separate windows!

:end
pause