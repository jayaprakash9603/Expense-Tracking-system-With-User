package com.jaya.service.impl;

import com.jaya.dto.UserSettingsDTO;
import com.jaya.exceptions.ResourceNotFoundException;
import com.jaya.mapper.UserSettingsMapper;
import com.jaya.models.UserSettings;
import com.jaya.repository.UserSettingsRepository;
import com.jaya.request.UpdateUserSettingsRequest;
import com.jaya.service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



















@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserSettingsServiceImpl implements UserSettingsService {

    private final UserSettingsRepository settingsRepository;
    private final UserSettingsMapper settingsMapper;

    









    @Override
    @Cacheable(value = "userSettings", key = "#userId")
    public UserSettingsDTO getUserSettings(Integer userId) {
        log.debug("Fetching settings for UserDTO ID: {}", userId);

        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("Settings not found for UserDTO ID: {}. Creating default settings.", userId);
                    return createAndSaveDefaultSettings(userId);
                });

        return settingsMapper.toDTO(settings);
    }

    










    @Override
    @CacheEvict(value = "userSettings", key = "#userId")
    public UserSettingsDTO updateUserSettings(Integer userId, UpdateUserSettingsRequest request) {
        log.debug("Updating settings for UserDTO ID: {}", userId);

        
        if (request == null) {
            throw new IllegalArgumentException("Update request cannot be null");
        }

        
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createAndSaveDefaultSettings(userId));

        
        settingsMapper.updateEntityFromRequest(settings, request);

        
        UserSettings updatedSettings = settingsRepository.save(settings);
        log.info("Successfully updated settings for UserDTO ID: {}", userId);

        return settingsMapper.toDTO(updatedSettings);
    }

    






    @Override
    @CacheEvict(value = "userSettings", key = "#userId")
    public UserSettingsDTO createDefaultSettings(Integer userId) {
        log.debug("Creating default settings for UserDTO ID: {}", userId);

        
        if (settingsRepository.existsByUserId(userId)) {
            log.warn("Settings already exist for UserDTO ID: {}. Returning existing settings.", userId);
            return getUserSettings(userId);
        }

        UserSettings settings = createAndSaveDefaultSettings(userId);
        return settingsMapper.toDTO(settings);
    }

    






    @Override
    @CacheEvict(value = "userSettings", key = "#userId")
    public void deleteUserSettings(Integer userId) {
        log.debug("Deleting settings for UserDTO ID: {}", userId);

        if (!settingsRepository.existsByUserId(userId)) {
            log.warn("No settings found for UserDTO ID: {}. Nothing to delete.", userId);
            return;
        }

        settingsRepository.deleteByUserId(userId);
        log.info("Successfully deleted settings for UserDTO ID: {}", userId);
    }

    





    @Override
    @Transactional(readOnly = true)
    public boolean settingsExist(Integer userId) {
        return settingsRepository.existsByUserId(userId);
    }

    






    @Override
    @CacheEvict(value = "userSettings", key = "#userId")
    public UserSettingsDTO resetToDefaults(Integer userId) {
        log.debug("Resetting settings to defaults for UserDTO ID: {}", userId);

        
        settingsRepository.deleteByUserId(userId);

        
        UserSettings settings = createAndSaveDefaultSettings(userId);
        log.info("Successfully reset settings to defaults for UserDTO ID: {}", userId);

        return settingsMapper.toDTO(settings);
    }

    





    private UserSettings createAndSaveDefaultSettings(Integer userId) {
        UserSettings defaultSettings = UserSettings.createDefaultSettings(userId);
        return settingsRepository.save(defaultSettings);
    }
}
