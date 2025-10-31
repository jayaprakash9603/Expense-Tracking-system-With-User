package com.jaya.service;

import com.jaya.modal.Notification;
import com.jaya.modal.UserDto;
import com.jaya.modal.ExpenseDTO;
import com.jaya.modal.BudgetDTO;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface NotificationService {

    // New method for creating notifications from events
    Notification createNotification(Notification notification);

    // New methods for notification management
    List<Notification> getUserNotifications(Integer userId, Boolean isRead, Integer limit, Integer offset);

    Notification markAsRead(Integer notificationId, Integer userId);

    void deleteNotification(Integer notificationId, Integer userId);

    void deleteAllNotifications(Integer userId);

    void markAllAsRead(Integer userId);

    Long getUnreadCount(Integer userId);

    void sendBudgetDTOExceededAlert(UserDto UserDto, BudgetDTO BudgetDTO, double currentSpending);

    void sendBudgetDTOWarningAlert(UserDto UserDto, BudgetDTO BudgetDTO, double currentSpending,
            double warningThreshold);

    void sendMonthlySpendingSummary(UserDto UserDto, LocalDate month);

    void sendDailyExpenseDTOReminder(UserDto UserDto);

    void sendWeeklyExpenseDTOReport(UserDto UserDto);

    void sendUnusualSpendingAlert(UserDto UserDto, ExpenseDTO ExpenseDTO);

    void sendRecurringExpenseDTOReminder(UserDto UserDto, List<ExpenseDTO> recurringExpenseDTOs);

    void sendGoalAchievementNotification(UserDto UserDto, String goalType, double targetAmount);

    void sendInactivityReminder(UserDto UserDto, int daysSinceLastExpenseDTO);

    void scheduleMonthlyReports(UserDto UserDto);

    void sendCustomAlert(UserDto UserDto, String message, String alertType);

    List<String> getNotificationHistory(UserDto UserDto, int limit);

    void sendBudgetExceededAlert(UserDto user, BudgetDTO budget, double currentSpending);

    public void sendBudgetWarningAlert(UserDto user, BudgetDTO budget, double currentSpending, double warningThreshold);

    public void sendDailyExpenseReminder(UserDto user);

    public void sendWeeklyExpenseReport(UserDto user);

    public void sendRecurringExpenseReminder(UserDto user, List<ExpenseDTO> recurringExpenses);

    public void updateNotificationPreferences(UserDto user, Map<String, Boolean> preferences);
    // void updateNotificationPreferences(UserDto UserDto, Map<String, Boolean>
    // preferences);
}