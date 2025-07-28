//package com.jaya.dto.mapper;
//
//import com.jaya.dto.*;
//import com.fasterxml.jackson.core.type.TypeReference;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@Component
//public class NotificationDTOMapper {
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    public NotificationDTO toDTO(Notification notification) {
//        NotificationDTO dto = new NotificationDTO();
//        dto.setId(notification.getId());
//        dto.setUserId(notification.getUserId());
//        dto.setTitle(notification.getTitle());
//        dto.setMessage(notification.getMessage());
//        dto.setIsRead(notification.getIsRead());
//        dto.setIsSent(notification.getIsSent());
//        dto.setCreatedAt(notification.getCreatedAt());
//        dto.setSentAt(notification.getSentAt());
//        dto.setReadAt(notification.getReadAt());
//        dto.setChannel(notification.getChannel());
//
//        // Parse metadata JSON string to Map
//        if (notification.getMetadata() != null) {
//            try {
//                Map<String, Object> metadata = objectMapper.readValue(
//                        notification.getMetadata(),
//                        new TypeReference<Map<String, Object>>() {}
//                );
//                dto.setMetadata(metadata);
//            } catch (Exception e) {
//                dto.setMetadata(new HashMap<>());
//            }
//        }
//
//        return dto;
//    }
//
//    public Notification toEntity(NotificationDTO dto) {
//        Notification notification = new Notification();
//        notification.setId(dto.getId());
//        notification.setUserId(dto.getUserId());
//        notification.setTitle(dto.getTitle());
//        notification.setMessage(dto.getMessage());
//        notification.setIsRead(dto.getIsRead());
//        notification.setIsSent(dto.getIsSent());
//        notification.setCreatedAt(dto.getCreatedAt());
//        notification.setSentAt(dto.getSentAt());
//        notification.setReadAt(dto.getReadAt());
//        notification.setChannel(dto.getChannel());
//
//        // Convert metadata Map to JSON string
//        if (dto.getMetadata() != null) {
//            try {
//                String metadataJson = objectMapper.writeValueAsString(dto.getMetadata());
//                notification.setMetadata(metadataJson);
//            } catch (Exception e) {
//                notification.setMetadata("{}");
//            }
//        }
//
//        return notification;
//    }
//
//    public NotificationPreferencesDTO toDTO(NotificationPreferences preferences) {
//        NotificationPreferencesDTO dto = new NotificationPreferencesDTO();
//        dto.setId(preferences.getId());
//        dto.setUserId(preferences.getUserId());
//        dto.setBudgetAlertsEnabled(preferences.getBudgetAlertsEnabled());
//        dto.setDailyRemindersEnabled(preferences.getDailyRemindersEnabled());
//        dto.setWeeklyReportsEnabled(preferences.getWeeklyReportsEnabled());
//        dto.setMonthlySummaryEnabled(preferences.getMonthlySummaryEnabled());
//        dto.setGoalNotificationsEnabled(preferences.getGoalNotificationsEnabled());
//        dto.setUnusualSpendingAlerts(preferences.getUnusualSpendingAlerts());
//        dto.setEmailNotifications(preferences.getEmailNotifications());
//        dto.setSmsNotifications(preferences.getSmsNotifications());
//        dto.setPushNotifications(preferences.getPushNotifications());
//        dto.setInAppNotifications(preferences.getInAppNotifications());
//        dto.setBudgetWarningThreshold(preferences.getBudgetWarningThreshold());
//        return dto;
//    }
//
//    public NotificationPreferences toEntity(NotificationPreferencesDTO dto) {
//        NotificationPreferences preferences = new NotificationPreferences();
//        preferences.setId(dto.getId());
//        preferences.setUserId(dto.getUserId());
//        preferences.setBudgetAlertsEnabled(dto.getBudgetAlertsEnabled());
//        preferences.setDailyRemindersEnabled(dto.getDailyRemindersEnabled());
//        preferences.setWeeklyReportsEnabled(dto.getWeeklyReportsEnabled());
//        preferences.setMonthlySummaryEnabled(dto.getMonthlySummaryEnabled());
//        preferences.setGoalNotificationsEnabled(dto.getGoalNotificationsEnabled());
//        preferences.setUnusualSpendingAlerts(dto.getUnusualSpendingAlerts());
//        preferences.setEmailNotifications(dto.getEmailNotifications());
//        preferences.setSmsNotifications(dto.getSmsNotifications());
//        preferences.setPushNotifications(dto.getPushNotifications());
//        preferences.setInAppNotifications(dto.getInAppNotifications());
//        preferences.setBudgetWarningThreshold(dto.getBudgetWarningThreshold());
//        return preferences;
//    }
//}