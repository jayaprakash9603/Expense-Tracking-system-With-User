package com.jaya.service;

import com.jaya.modal.*;
import com.jaya.repository.NotificationRepository;
import com.jaya.repository.NotificationPreferencesRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

        @Autowired
        private NotificationRepository notificationRepository;

        @Autowired
        private NotificationPreferencesRepository preferencesRepository;

        @Autowired
        private EmailService emailService;

        @Autowired
        private ObjectMapper objectMapper;

        // =========================
        // NEW METHODS FOR EVENT-BASED NOTIFICATIONS
        // =========================

        /**
         * Create and save a notification
         */
        @Override
        public Notification createNotification(Notification notification) {
                return notificationRepository.save(notification);
        }

        /**
         * Get user notifications with pagination and filtering
         */
        @Override
        public List<Notification> getUserNotifications(Integer userId, Boolean isRead, Integer limit, Integer offset) {
                if (limit == null)
                        limit = 20;
                if (offset == null)
                        offset = 0;

                PageRequest pageRequest = PageRequest.of(offset / limit, limit);

                if (isRead == null) {
                        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageRequest)
                                        .getContent();
                } else {
                        return notificationRepository
                                        .findByUserIdAndIsReadOrderByCreatedAtDesc(userId, isRead, pageRequest)
                                        .getContent();
                }
        }

        /**
         * Mark notification as read
         */
        @Override
        public Notification markAsRead(Integer notificationId, Integer userId) {
                Notification notification = notificationRepository.findById(notificationId)
                                .orElseThrow(() -> new RuntimeException("Notification not found"));

                if (!notification.getUserId().equals(userId)) {
                        throw new RuntimeException("Unauthorized access to notification");
                }

                notification.setIsRead(true);
                notification.setReadAt(LocalDateTime.now());
                return notificationRepository.save(notification);
        }

        /**
         * Delete a notification
         */
        @Override
        public void deleteNotification(Integer notificationId, Integer userId) {
                Notification notification = notificationRepository.findById(notificationId)
                                .orElseThrow(() -> new RuntimeException("Notification not found"));

                if (!notification.getUserId().equals(userId)) {
                        throw new RuntimeException("Unauthorized access to notification");
                }

                notificationRepository.delete(notification);
        }

        /**
         * Delete all notifications for a user
         */
        @Override
        public void deleteAllNotifications(Integer userId) {
                notificationRepository.deleteByUserId(userId);
        }

        /**
         * Mark all notifications as read for a user
         */
        @Override
        public void markAllAsRead(Integer userId) {
                List<Notification> notifications = notificationRepository.findByUserIdAndIsRead(userId, false);
                notifications.forEach(notification -> {
                        notification.setIsRead(true);
                        notification.setReadAt(LocalDateTime.now());
                });
                notificationRepository.saveAll(notifications);
        }

        /**
         * Get unread notification count for a user
         */
        @Override
        public Long getUnreadCount(Integer userId) {
                return notificationRepository.countByUserIdAndIsRead(userId, false);
        }

        // =========================
        // EXISTING METHODS
        // =========================

        @Override
        @Async
        public void sendBudgetExceededAlert(UserDto user, BudgetDTO budget, double currentSpending) {
                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getBudgetAlertsEnabled())
                        return;

                String title = "Budget Exceeded Alert";
                String message = String.format("Your budget '%s' has been exceeded! " +
                                "Budget: $%.2f, Current Spending: $%.2f",
                                budget.getName(), budget.getAmount(), currentSpending);

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("budgetId", budget.getId());
                metadata.put("budgetAmount", budget.getAmount());
                metadata.put("currentSpending", currentSpending);
                metadata.put("overspent", currentSpending - budget.getAmount());

                createAndSendNotification(user, title, message, NotificationType.BUDGET_EXCEEDED,
                                NotificationPriority.HIGH, metadata);
        }

        @Override
        @Async
        public void sendBudgetWarningAlert(UserDto user, BudgetDTO budget, double currentSpending,
                        double warningThreshold) {
                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getBudgetAlertsEnabled())
                        return;

                double percentage = (currentSpending / budget.getAmount()) * 100;
                String title = "Budget Warning";
                String message = String.format("You've used %.1f%% of your budget '%s'. " +
                                "Budget: $%.2f, Current Spending: $%.2f",
                                percentage, budget.getName(), budget.getAmount(), currentSpending);

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("budgetId", budget.getId());
                metadata.put("budgetAmount", budget.getAmount());
                metadata.put("currentSpending", currentSpending);
                metadata.put("percentage", percentage);

                createAndSendNotification(user, title, message, NotificationType.BUDGET_WARNING,
                                NotificationPriority.MEDIUM, metadata);
        }

        @Override
        @Async
        public void sendBudgetDTOExceededAlert(UserDto user, BudgetDTO budget, double currentSpending) {
                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getBudgetAlertsEnabled())
                        return;

                String title = "Budget Exceeded Alert";
                String message = String.format("Your budget '%s' has been exceeded! " +
                                "Budget: $%.2f, Current Spending: $%.2f",
                                budget.getName(), budget.getAmount(), currentSpending);

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("budgetId", budget.getId());
                metadata.put("budgetAmount", budget.getAmount());
                metadata.put("currentSpending", currentSpending);
                metadata.put("overspent", currentSpending - budget.getAmount());

                createAndSendNotification(user, title, message, NotificationType.BUDGET_EXCEEDED,
                                NotificationPriority.HIGH, metadata);
        }

        @Override
        @Async
        public void sendBudgetDTOWarningAlert(UserDto user, BudgetDTO budget, double currentSpending,
                        double warningThreshold) {
                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getBudgetAlertsEnabled())
                        return;

                double percentage = (currentSpending / budget.getAmount()) * 100;
                String title = "Budget Warning";
                String message = String.format("You've used %.1f%% of your budget '%s'. " +
                                "Budget: $%.2f, Current Spending: $%.2f",
                                percentage, budget.getName(), budget.getAmount(), currentSpending);

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("budgetId", budget.getId());
                metadata.put("budgetAmount", budget.getAmount());
                metadata.put("currentSpending", currentSpending);
                metadata.put("percentage", percentage);
                metadata.put("warningThreshold", warningThreshold);

                createAndSendNotification(user, title, message, NotificationType.BUDGET_WARNING,
                                NotificationPriority.MEDIUM, metadata);
        }

        @Override
        @Async
        public void sendMonthlySpendingSummary(UserDto user, LocalDate month) {
                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getMonthlySummaryEnabled())
                        return;

                String title = "Monthly Spending Summary";
                String message = String.format("Your spending summary for %s is ready. " +
                                "Check your dashboard for detailed insights.", month.getMonth().name());

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("month", month.toString());
                metadata.put("year", month.getYear());

                createAndSendNotification(user, title, message, NotificationType.MONTHLY_SUMMARY,
                                NotificationPriority.LOW, metadata);
        }

        @Override
        @Async
        public void sendDailyExpenseDTOReminder(UserDto user) {
                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getDailyRemindersEnabled())
                        return;

                String title = "Daily Expense Reminder";
                String message = "Don't forget to log your expenses for today! " +
                                "Keeping track daily helps you stay on budget.";

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("reminderDate", LocalDate.now().toString());
                metadata.put("reminderType", "daily_expense");

                createAndSendNotification(user, title, message, NotificationType.DAILY_REMINDER,
                                NotificationPriority.LOW, metadata);
        }

        @Override
        @Async
        public void sendWeeklyExpenseDTOReport(UserDto user) {
                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getWeeklyReportsEnabled())
                        return;

                String title = "Weekly Expense Report";
                String message = "Your weekly expense report is ready! " +
                                "Review your spending patterns and stay on track.";

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("weekStart", LocalDate.now().minusDays(7).toString());
                metadata.put("weekEnd", LocalDate.now().toString());
                metadata.put("reportType", "weekly_expense");

                createAndSendNotification(user, title, message, NotificationType.WEEKLY_REPORT,
                                NotificationPriority.LOW, metadata);
        }

        @Override
        @Async
        public void sendDailyExpenseReminder(UserDto user) {
                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getDailyRemindersEnabled())
                        return;

                String title = "Daily Expense Reminder";
                String message = "Don't forget to log your expenses for today! " +
                                "Keeping track daily helps you stay on budget.";

                createAndSendNotification(user, title, message, NotificationType.DAILY_REMINDER,
                                NotificationPriority.LOW, new HashMap<>());
        }

        @Override
        @Async
        public void sendWeeklyExpenseReport(UserDto user) {
                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getWeeklyReportsEnabled())
                        return;

                String title = "Weekly Expense Report";
                String message = "Your weekly expense report is ready! " +
                                "Review your spending patterns and stay on track.";

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("weekStart", LocalDate.now().minusDays(7).toString());
                metadata.put("weekEnd", LocalDate.now().toString());

                createAndSendNotification(user, title, message, NotificationType.WEEKLY_REPORT,
                                NotificationPriority.LOW, metadata);
        }

        @Override
        @Async
        public void sendUnusualSpendingAlert(UserDto user, ExpenseDTO expense) {
                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getUnusualSpendingAlerts())
                        return;

                String title = "Unusual Spending Detected";
                String message = String.format("Unusual spending detected: $%.2f for '%s'. " +
                                "This is significantly higher than your usual spending pattern.",
                                expense.getExpenseDetails().getAmount(), expense.getExpenseDetails().getExpenseName());

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("expenseId", expense.getId());
                metadata.put("amount", expense.getExpenseDetails().getAmount());
                metadata.put("expenseName", expense.getExpenseDetails().getExpenseName());

                createAndSendNotification(user, title, message, NotificationType.UNUSUAL_SPENDING,
                                NotificationPriority.MEDIUM, metadata);
        }

        @Override
        @Async
        public void sendRecurringExpenseDTOReminder(UserDto user, List<ExpenseDTO> recurringExpenses) {
                if (recurringExpenses.isEmpty())
                        return;

                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getDailyRemindersEnabled())
                        return;

                String title = "Recurring Expenses Due";
                String message = String.format("You have %d recurring expense(s) due today. " +
                                "Don't forget to process them!", recurringExpenses.size());

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("expenseCount", recurringExpenses.size());
                metadata.put("expenseIds", recurringExpenses.stream()
                                .map(ExpenseDTO::getId).collect(Collectors.toList()));
                metadata.put("reminderType", "recurring_expense_dto");

                createAndSendNotification(user, title, message, NotificationType.RECURRING_EXPENSE,
                                NotificationPriority.MEDIUM, metadata);
        }

        @Override
        @Async
        public void sendRecurringExpenseReminder(UserDto user, List<ExpenseDTO> recurringExpenses) {
                if (recurringExpenses.isEmpty())
                        return;

                String title = "Recurring Expenses Due";
                String message = String.format("You have %d recurring expense(s) due today. " +
                                "Don't forget to process them!", recurringExpenses.size());

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("expenseCount", recurringExpenses.size());
                metadata.put("expenseIds", recurringExpenses.stream()
                                .map(ExpenseDTO::getId).collect(Collectors.toList()));

                createAndSendNotification(user, title, message, NotificationType.RECURRING_EXPENSE,
                                NotificationPriority.MEDIUM, metadata);
        }

        @Override
        @Async
        public void sendGoalAchievementNotification(UserDto user, String goalType, double targetAmount) {
                NotificationPreferences prefs = getUserPreferences(user.getId());
                if (!prefs.getGoalNotificationsEnabled())
                        return;

                String title = "Goal Achievement!";
                String message = String.format("Congratulations! You've achieved your %s goal of $%.2f!",
                                goalType, targetAmount);

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("goalType", goalType);
                metadata.put("targetAmount", targetAmount);
                metadata.put("achievedDate", LocalDate.now().toString());

                createAndSendNotification(user, title, message, NotificationType.GOAL_ACHIEVEMENT,
                                NotificationPriority.HIGH, metadata);
        }

        @Override
        @Async
        public void sendInactivityReminder(UserDto user, int daysSinceLastExpense) {
                String title = "Expense Tracking Reminder";
                String message = String.format("It's been %d days since your last expense entry. " +
                                "Keep your financial tracking up to date!", daysSinceLastExpense);

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("daysSinceLastExpense", daysSinceLastExpense);

                createAndSendNotification(user, title, message, NotificationType.INACTIVITY_REMINDER,
                                NotificationPriority.LOW, metadata);
        }

        @Override
        @Async
        public void scheduleMonthlyReports(UserDto user) {
                // This would typically be called by a scheduler
                sendMonthlySpendingSummary(user, LocalDate.now().minusMonths(1));
        }

        @Override
        @Async
        public void sendCustomAlert(UserDto user, String message, String alertType) {
                String title = "Custom Alert";

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("alertType", alertType);

                createAndSendNotification(user, title, message, NotificationType.CUSTOM_ALERT,
                                NotificationPriority.MEDIUM, metadata);
        }

        @Override
        public List<String> getNotificationHistory(UserDto user, int limit) {
                List<Notification> notifications = notificationRepository
                                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, limit))
                                .getContent();

                return notifications.stream()
                                .map(n -> String.format("[%s] %s: %s",
                                                n.getCreatedAt().toLocalDate(), n.getTitle(), n.getMessage()))
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public void updateNotificationPreferences(UserDto user, Map<String, Boolean> preferences) {
                NotificationPreferences prefs = getUserPreferences(user.getId());

                preferences.forEach((key, value) -> {
                        switch (key) {
                                case "budgetAlertsEnabled" -> prefs.setBudgetAlertsEnabled(value);
                                case "dailyRemindersEnabled" -> prefs.setDailyRemindersEnabled(value);
                                case "weeklyReportsEnabled" -> prefs.setWeeklyReportsEnabled(value);
                                case "monthlySummaryEnabled" -> prefs.setMonthlySummaryEnabled(value);
                                case "goalNotificationsEnabled" -> prefs.setGoalNotificationsEnabled(value);
                                case "unusualSpendingAlerts" -> prefs.setUnusualSpendingAlerts(value);
                                case "emailNotifications" -> prefs.setEmailNotifications(value);
                                case "smsNotifications" -> prefs.setSmsNotifications(value);
                                case "pushNotifications" -> prefs.setPushNotifications(value);
                                case "inAppNotifications" -> prefs.setInAppNotifications(value);
                        }
                });

                preferencesRepository.save(prefs);
        }

        // Helper methods
        private void createAndSendNotification(UserDto user, String title, String message,
                        NotificationType type, NotificationPriority priority,
                        Map<String, Object> metadata) {
                try {
                        Notification notification = new Notification();
                        notification.setUserId(user.getId());
                        notification.setTitle(title);
                        notification.setMessage(message);
                        notification.setType(type);
                        notification.setPriority(priority);
                        notification.setMetadata(objectMapper.writeValueAsString(metadata));

                        NotificationPreferences prefs = getUserPreferences(user.getId());

                        // Save notification
                        notification = notificationRepository.save(notification);

                        // Send via enabled channels
                        if (prefs.getEmailNotifications()) {
                                sendEmailNotification(user, notification);
                        }

                        if (prefs.getInAppNotifications()) {
                                // In-app notifications are handled by saving to database
                                notification.setChannel("IN_APP");
                        }

                        notification.setIsSent(true);
                        notification.setSentAt(LocalDateTime.now());
                        notificationRepository.save(notification);

                } catch (Exception e) {
                        // Log error
                        System.err.println("Failed to create notification: " + e.getMessage());
                }
        }

        private void sendEmailNotification(UserDto user, Notification notification) {
                try {
                        emailService.sendSimpleMessage(
                                        user.getEmail(),
                                        notification.getTitle(),
                                        notification.getMessage());
                } catch (Exception e) {
                        System.err.println("Failed to send email notification: " + e.getMessage());
                }
        }

        private NotificationPreferences getUserPreferences(Integer userId) {
                return preferencesRepository.findByUserId(userId)
                                .orElseGet(() -> createDefaultPreferences(userId));
        }

        private NotificationPreferences createDefaultPreferences(Integer userId) {
                NotificationPreferences prefs = new NotificationPreferences();
                prefs.setUserId(userId);
                return preferencesRepository.save(prefs);
        }
}