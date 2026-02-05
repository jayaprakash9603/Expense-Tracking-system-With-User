package com.jaya.service;

import com.jaya.dto.NotificationPreferencesResponseDTO;
import com.jaya.dto.UpdateNotificationPreferencesRequest;
public interface NotificationPreferencesService {

    NotificationPreferencesResponseDTO getPreferences(Integer userId);

    NotificationPreferencesResponseDTO updatePreferences(Integer userId, UpdateNotificationPreferencesRequest request);

    NotificationPreferencesResponseDTO resetToDefaults(Integer userId);

    void deletePreferences(Integer userId);

    boolean preferencesExist(Integer userId);

    NotificationPreferencesResponseDTO createDefaultPreferences(Integer userId);
}
