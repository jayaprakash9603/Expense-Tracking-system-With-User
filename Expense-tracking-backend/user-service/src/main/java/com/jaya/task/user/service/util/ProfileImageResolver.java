package com.jaya.task.user.service.util;

import com.jaya.task.user.service.modal.User;

public final class ProfileImageResolver {

    private ProfileImageResolver() {
    }

    public static String resolveDisplayImage(User user) {
        if (user == null) {
            return null;
        }

        if (hasText(user.getProfileImage())) {
            return user.getProfileImage().trim();
        }

        if (hasText(user.getOauthProfileImage())) {
            return user.getOauthProfileImage().trim();
        }

        return null;
    }

    public static boolean isUsingGoogleProfileImage(User user) {
        if (user == null || !hasText(user.getProfileImage()) || !hasText(user.getOauthProfileImage())) {
            return false;
        }
        return user.getProfileImage().trim().equals(user.getOauthProfileImage().trim());
    }

    public static void syncGoogleProfileImage(User user, String googlePictureUrl) {
        if (user == null || !hasText(googlePictureUrl)) {
            return;
        }

        String newPicture = googlePictureUrl.trim();
        String previousOauth = user.getOauthProfileImage();
        user.setOauthProfileImage(newPicture);

        String currentProfile = user.getProfileImage();
        if (!hasText(currentProfile)) {
            user.setProfileImage(newPicture);
            return;
        }

        if (hasText(previousOauth) && currentProfile.trim().equals(previousOauth.trim())) {
            user.setProfileImage(newPicture);
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
