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

    







    @Transactional
    public AuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        AuthResponse response = new AuthResponse();

        try {
            
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                response.setStatus(false);
                response.setMessage("Email is required");
                return response;
            }

            
            GoogleUserInfo googleUser = GoogleUserInfo.builder()
                    .sub(request.getSub())
                    .email(request.getEmail())
                    .emailVerified(true) 
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

            
            User user = findOrCreateGoogleUser(googleUser);

            
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

    






    private User findOrCreateGoogleUser(GoogleUserInfo googleUser) {
        Optional<User> existingUserOpt = Optional.ofNullable(
                userRepository.findByEmail(googleUser.getEmail()));

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();

            
            if (AUTH_PROVIDER_LOCAL.equals(existingUser.getAuthProvider())) {
                log.info("Linking Google account to existing LOCAL user: {}", existingUser.getEmail());
                existingUser.setAuthProvider(AUTH_PROVIDER_GOOGLE);
                existingUser.setProviderId(googleUser.getSub());

                
                if (existingUser.getProfileImage() == null && googleUser.getPicture() != null) {
                    existingUser.setOauthProfileImage(googleUser.getPicture());
                }

                return userRepository.save(existingUser);
            }

            
            return existingUser;
        }

        
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

        
        if (googleUser.getGender() != null) {
            
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

        
        newUser.setPassword(null);

        
        newUser.setRoles(new HashSet<>());
        newUser.addRole("USER");
        newUser.setCurrentMode("USER");

        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(newUser);
    }

    






    public boolean canAuthenticateWithGoogle(String email) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            
            return true;
        }

        
        return true;
    }
}
