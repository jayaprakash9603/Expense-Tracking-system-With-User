package com.jaya.task.user.service.util;

import com.jaya.task.user.service.modal.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ProfileImageResolverTest {

    @Test
    void resolveDisplayImage_prefersCustomUploadOverGoogleImage() {
        User user = new User();
        user.setProfileImage("https://res.cloudinary.com/demo/image/upload/avatar.jpg");
        user.setOauthProfileImage("https://lh3.googleusercontent.com/a/google-photo");

        assertEquals(
                "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
                ProfileImageResolver.resolveDisplayImage(user));
    }

    @Test
    void resolveDisplayImage_fallsBackToGoogleImageWhenCustomMissing() {
        User user = new User();
        user.setOauthProfileImage("https://lh3.googleusercontent.com/a/google-photo");

        assertEquals(
                "https://lh3.googleusercontent.com/a/google-photo",
                ProfileImageResolver.resolveDisplayImage(user));
    }

    @Test
    void syncGoogleProfileImage_updatesDisplayWhenStillUsingGooglePhoto() {
        User user = new User();
        user.setOauthProfileImage("https://lh3.googleusercontent.com/a/old-photo");
        user.setProfileImage("https://lh3.googleusercontent.com/a/old-photo");

        ProfileImageResolver.syncGoogleProfileImage(
                user, "https://lh3.googleusercontent.com/a/new-photo");

        assertEquals("https://lh3.googleusercontent.com/a/new-photo", user.getOauthProfileImage());
        assertEquals("https://lh3.googleusercontent.com/a/new-photo", user.getProfileImage());
    }

    @Test
    void syncGoogleProfileImage_preservesCustomUpload() {
        User user = new User();
        user.setOauthProfileImage("https://lh3.googleusercontent.com/a/old-photo");
        user.setProfileImage("https://res.cloudinary.com/demo/image/upload/avatar.jpg");

        ProfileImageResolver.syncGoogleProfileImage(
                user, "https://lh3.googleusercontent.com/a/new-photo");

        assertEquals("https://lh3.googleusercontent.com/a/new-photo", user.getOauthProfileImage());
        assertEquals(
                "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
                user.getProfileImage());
    }

    @Test
    void resolveDisplayImage_returnsNullWhenNoImageAvailable() {
        assertNull(ProfileImageResolver.resolveDisplayImage(new User()));
    }
}
