package com.jaya.service;

import com.jaya.modal.Notification;
import com.jaya.common.dto.UserDTO;
import com.jaya.modal.ExpenseDTO;
import com.jaya.modal.BudgetDTO;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface NotificationService {
    Notification createNotification(Notification notification);

    List<Notification> getUserNotifications(Integer userId, Boolean isRead, Integer limit, Integer offset);

    Notification markAsRead(Integer notificationId, Integer userId);

    void deleteNotification(Integer notificationId, Integer userId);

    void deleteAllNotifications(Integer userId);

    void markAllAsRead(Integer userId);

    Long getUnreadCount(Integer userId);

    void sendBudgetDTOExceededAlert(UserDTO user, BudgetDTO BudgetDTO, double currentSpending);

    void sendBudgetDTOWarningAlert(UserDTO user, BudgetDTO BudgetDTO, double currentSpending,
            double warningThreshold);

    void sendMonthlySpendingSummary(UserDTO user, LocalDate month);

    void sendDailyExpenseDTOReminder(UserDTO user);

    void sendWeeklyExpenseDTOReport(UserDTO user);

    void sendUnusualSpendingAlert(UserDTO user, ExpenseDTO ExpenseDTO);

    void sendRecurringExpenseDTOReminder(UserDTO user, List<ExpenseDTO> recurringExpenseDTOs);

    void sendGoalAchievementNotification(UserDTO user, String goalType, double targetAmount);

    void sendInactivityReminder(UserDTO user, int daysSinceLastExpenseDTO);

    void scheduleMonthlyReports(UserDTO user);

    void sendCustomAlert(UserDTO user, String message, String alertType);

    List<String> getNotificationHistory(UserDTO user, int limit);

    void sendBudgetExceededAlert(UserDTO user, BudgetDTO budget, double currentSpending);

    public void sendBudgetWarningAlert(UserDTO user, BudgetDTO budget, double currentSpending, double warningThreshold);

    public void sendDailyExpenseReminder(UserDTO user);

    public void sendWeeklyExpenseReport(UserDTO user);

    public void sendRecurringExpenseReminder(UserDTO user, List<ExpenseDTO> recurringExpenses);

    public void updateNotificationPreferences(UserDTO user, Map<String, Boolean> preferences);
}