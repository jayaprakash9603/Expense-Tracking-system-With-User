package com.jaya.service;

import com.jaya.dto.UserSettingsDTO;
import com.jaya.request.UpdateUserSettingsRequest;












public interface UserSettingsService {

    






    UserSettingsDTO getUserSettings(Integer userId);

    







    UserSettingsDTO updateUserSettings(Integer userId, UpdateUserSettingsRequest request);

    






    UserSettingsDTO createDefaultSettings(Integer userId);

    





    void deleteUserSettings(Integer userId);

    





    boolean settingsExist(Integer userId);

    





    UserSettingsDTO resetToDefaults(Integer userId);
}
