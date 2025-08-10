Write-Host "Starting all services in separate tabs..."

# Check if Windows Terminal is available
if (Get-Command wt -ErrorAction SilentlyContinue) {
    # Use Windows Terminal with separate tabs
    $services = @(
        @{Name="EurekaServer"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\eureka-server"},
        @{Name="GatewayService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Gateway"},
        @{Name="UserService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\User-Service"},
        @{Name="ExpenseTracking"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\social-media-app"},
        @{Name="ChatService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Chat-Service"},
        @{Name="PaymentService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Payment-method-Service"},
        @{Name="CategoryService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Category-Service"},
        @{Name="FriendShipService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\FriendShip-Service"},
        @{Name="BudgetService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Budget-Service"},
        @{Name="BillService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Bill-Service"},
        @{Name="AuditService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Audit-Service"}
    )

    $wtCommand = "wt"
    for ($i = 0; $i -lt $services.Count; $i++) {
        $service = $services[$i]
        if ($i -eq 0) {
            $wtCommand += " new-tab --title `"$($service.Name)`" cmd /k `"cd /d $($service.Path) && mvn spring-boot:run`""
        } else {
            $wtCommand += " ; new-tab --title `"$($service.Name)`" cmd /k `"cd /d $($service.Path) && mvn spring-boot:run`""
        }
    }

    Invoke-Expression $wtCommand
    Write-Host "All services launched in separate tabs!"
} else {
    Write-Host "Windows Terminal not found. Please install Windows Terminal for tab support."
    Write-Host "Falling back to separate windows..."

    # Fallback to separate windows
    $services = @(
        @{Name="EurekaServer"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\eureka-server"},
        @{Name="GatewayService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Gateway"},
        @{Name="UserService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\User-Service"},
        @{Name="ExpenseTracking"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\social-media-app"},
        @{Name="ChatService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Chat-Service"},
        @{Name="PaymentService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Payment-method-Service"},
        @{Name="CategoryService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Category-Service"},
        @{Name="FriendShipService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\FriendShip-Service"},
        @{Name="BudgetService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Budget-Service"},
        @{Name="BillService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Bill-Service"},
        @{Name="AuditService"; Path="Expense-tracking-System-backend\Expense-tracking-backend-main\Audit-Service"}
    )

    foreach ($service in $services) {
        Start-Process cmd -ArgumentList "/k", "cd /d $($service.Path) && mvn spring-boot:run" -WindowStyle Normal
    }
    Write-Host "All services launched in separate windows!"
}

Read-Host "Press Enter to exit"