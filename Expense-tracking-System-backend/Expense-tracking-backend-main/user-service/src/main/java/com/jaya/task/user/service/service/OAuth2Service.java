package com.jaya.task.user.service.service;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.dto.GoogleUserInfo;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.GoogleAuthRequest;
import com.jaya.task.user.service.response.AuthResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;

/**
 * Service for handling Google OAuth2 authentication.
 * Manages user creation/authentication based on Google user info.
 */
@Service
@Slf4j
public class OAuth2Service {

    private static final String AUTH_PROVIDER_GOOGLE = "GOOGLE";
    private static final String AUTH_PROVIDER_LOCAL = "LOCAL";

    @Value("${google.oauth2.client-id}")
    private String googleClientId;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomUserServiceImplementation customUserService;

    /**
     * Authenticates a user using Google OAuth2 user info.
     * Creates a new user if one doesn't exist, or links/authenticates existing
     * user.
     *
     * @param request The Google auth request containing user info from frontend
     * @return AuthResponse containing JWT token and status
     */
    @Transactional
    public AuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        AuthResponse response = new AuthResponse();

        try {
            // Validate required fields
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                response.setStatus(false);
                response.setMessage("Email is required");
                return response;
            }

            // Build GoogleUserInfo from request
            GoogleUserInfo googleUser = GoogleUserInfo.builder()
                    .sub(request.getSub())
                    .email(request.getEmail())
                    .emailVerified(true) // Google only returns verified emails via OAuth
                    .name(request.getName())
                    .givenName(request.getGivenName())
                    .familyName(request.getFamilyName())
                    .picture(request.getPicture())
                    .gender(request.getGender())
                    .birthday(request.getBirthday())
                    .phoneNumber(request.getPhoneNumber())
                    .locale(request.getLocale())
                    .build();

            log.info("Google authentication for email: {}", googleUser.getEmail());

            // Find or create user
            User user = findOrCreateGoogleUser(googleUser);

            // Generate JWT token
            UserDetails userDetails = customUserService.loadUserByUsername(user.getEmail());
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails.getUsername(),
                    null,
                    userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = JwtProvider.generateToken(authentication);

            response.setStatus(true);
            response.setMessage("Google authentication successful");
            response.setJwt(token);

            log.info("Google authentication successful for user: {}", user.getEmail());

        } catch (Exception e) {
            log.error("Error during Google authentication: {}", e.getMessage(), e);
            response.setStatus(false);
            response.setMessage("Authentication failed: " + e.getMessage());
        }

        return response;
    }

    /**
     * Finds an existing user by email or creates a new Google user.
     * Handles account linking when a LOCAL user signs in with Google.
     *
     * @param googleUser User info from Google
     * @return The User entity
     */
    private User findOrCreateGoogleUser(GoogleUserInfo googleUser) {
        Optional<User> existingUserOpt = Optional.ofNullable(
                userRepository.findByEmail(googleUser.getEmail()));

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();

            // If existing user was LOCAL, link their Google account
            if (AUTH_PROVIDER_LOCAL.equals(existingUser.getAuthProvider())) {
                log.info("Linking Google account to existing LOCAL user: {}", existingUser.getEmail());
                existingUser.setAuthProvider(AUTH_PROVIDER_GOOGLE);
                existingUser.setProviderId(googleUser.getSub());

                // Update profile image if not set
                if (existingUser.getProfileImage() == null && googleUser.getPicture() != null) {
                    existingUser.setOauthProfileImage(googleUser.getPicture());
                }

                return userRepository.save(existingUser);
            }

            // User already authenticated with Google before
            return existingUser;
        }

        // Create new Google user
        log.info("Creating new Google user: {}", googleUser.getEmail());

        User newUser = new User();
        newUser.setEmail(googleUser.getEmail());
        newUser.setFullName(googleUser.getName() != null ? googleUser.getName()
                : googleUser.getGivenName() + " " + googleUser.getFamilyName());
        newUser.setFirstName(googleUser.getGivenName());
        newUser.setLastName(googleUser.getFamilyName());
        newUser.setAuthProvider(AUTH_PROVIDER_GOOGLE);
        newUser.setProviderId(googleUser.getSub());
        newUser.setOauthProfileImage(googleUser.getPicture());
        newUser.setProfileImage(googleUser.getPicture());

        // Set additional fields from Google People API
        if (googleUser.getGender() != null) {
            // Convert Google's gender format to our format (MALE, FEMALE, OTHER)
            String gender = googleUser.getGender().toUpperCase();
            if (gender.equals("MALE") || gender.equals("FEMALE") || gender.equals("OTHER")) {
                newUser.setGender(gender);
            }
        }

        if (googleUser.getBirthday() != null) {
            newUser.setDateOfBirth(googleUser.getBirthday());
        }

        if (googleUser.getPhoneNumber() != null) {
            newUser.setMobile(googleUser.getPhoneNumber());
            newUser.setPhoneNumber(googleUser.getPhoneNumber());
        }

        // No password for OAuth users
        newUser.setPassword(null);

        // Set default role
        newUser.setRoles(new HashSet<>());
        newUser.addRole("USER");
        newUser.setCurrentMode("USER");

        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(newUser);
    }

    /**
     * Checks if a user can sign in with Google.
     * Users who registered locally can still link their Google account.
     *
     * @param email The user's email
     * @return true if user can authenticate with Google
     */
    public boolean canAuthenticateWithGoogle(String email) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            // New user can sign up with Google
            return true;
        }

        // Existing users can always link/use Google
        return true;
    }
}
