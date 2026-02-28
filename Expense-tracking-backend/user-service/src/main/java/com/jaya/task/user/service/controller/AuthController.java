package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.request.LoginRequest;
import com.jaya.task.user.service.request.SignupRequest;
import com.jaya.task.user.service.request.VerifyLoginOtpRequest;
import com.jaya.task.user.service.response.AuthResponse;
import com.jaya.task.user.service.service.CustomUserServiceImplementation;
import com.jaya.task.user.service.exceptions.MissingRequestHeaderException;
import com.jaya.task.user.service.exceptions.UserAlreadyExistsException;
import com.jaya.task.user.service.service.OtpService;
import com.jaya.task.user.service.service.TotpService;
import com.jaya.task.user.service.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/auth")
@Validated
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomUserServiceImplementation customUserService;

    @Autowired
    private TotpService totpService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {

        User savedUser = userService.signup(signupRequest);

        UserDetails userDetails = customUserService.loadUserByUsername(savedUser.getEmail());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails.getUsername(),
                null,
                userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = JwtProvider.generateToken(authentication);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setStatus(true);
        authResponse.setMessage("Registration Success");
        authResponse.setJwt(token);

        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);

    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        
        User user = userRepository.findByEmail(username);
        if (user != null && "GOOGLE".equals(user.getAuthProvider()) &&
                (user.getPassword() == null || user.getPassword().isEmpty())) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setStatus(false);
            authResponse.setMessage("OAUTH_NO_PASSWORD");
            return new ResponseEntity<>(authResponse, HttpStatus.UNAUTHORIZED);
        }

        try {
            Authentication authentication = authenticate(username, password);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            
            
            
            
            

            
            if (user != null && user.isMfaEnabled()) {
                
                String mfaToken = JwtProvider.generateMfaToken(authentication);

                AuthResponse authResponse = new AuthResponse();
                authResponse.setStatus(true);
                authResponse.setMessage("MFA_REQUIRED");
                authResponse.setMfaRequired(true);
                authResponse.setMfaToken(mfaToken);
                authResponse.setTwoFactorRequired(false);
                authResponse.setJwt(null);

                return new ResponseEntity<>(authResponse, HttpStatus.OK);
            }

            
            if (user != null && user.isTwoFactorEnabled()) {
                otpService.generateAndSendLoginOtp(username);

                AuthResponse authResponse = new AuthResponse();
                authResponse.setStatus(true);
                authResponse.setMessage("OTP_REQUIRED");
                authResponse.setTwoFactorRequired(true);
                authResponse.setMfaRequired(false);
                authResponse.setJwt(null);

                return new ResponseEntity<>(authResponse, HttpStatus.OK);
            }

            
            String token = JwtProvider.generateToken(authentication);

            AuthResponse authResponse = new AuthResponse();
            authResponse.setStatus(true);
            authResponse.setMessage("Login Success");
            authResponse.setJwt(token);
            authResponse.setTwoFactorRequired(false);
            authResponse.setMfaRequired(false);

            return new ResponseEntity<>(authResponse, HttpStatus.OK);
        } catch (BadCredentialsException ex) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setStatus(false);
            authResponse.setMessage("Invalid Username or Password");
            authResponse.setTwoFactorRequired(false);
            authResponse.setMfaRequired(false);
            return new ResponseEntity<>(authResponse, HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/verify-login-otp")
    public ResponseEntity<AuthResponse> verifyLoginOtp(@Valid @RequestBody VerifyLoginOtpRequest request) {
        String email = request.getEmail();
        String otp = request.getOtp();

        boolean isValid = otpService.verifyOtp(email, otp);
        if (!isValid) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setStatus(false);
            authResponse.setMessage("Invalid or expired OTP");
            authResponse.setTwoFactorRequired(true);
            return new ResponseEntity<>(authResponse, HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setStatus(false);
            authResponse.setMessage("User not found");
            authResponse.setTwoFactorRequired(false);
            return new ResponseEntity<>(authResponse, HttpStatus.NOT_FOUND);
        }

        UserDetails userDetails = customUserService.loadUserByUsername(email);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails.getUsername(),
                null,
                userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = JwtProvider.generateToken(authentication);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setStatus(true);
        authResponse.setMessage("Login Success");
        authResponse.setJwt(token);
        authResponse.setTwoFactorRequired(false);

        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    private Authentication authenticate(String username, String password) {
        try {
            UserDetails userDetails = customUserService.loadUserByUsername(username);
            if (userDetails == null || !passwordEncoder.matches(password, userDetails.getPassword())) {
                throw new BadCredentialsException("Invalid Username or Password");
            }
            return new UsernamePasswordAuthenticationToken(
                    userDetails.getUsername(),
                    null,
                    userDetails.getAuthorities());
        } catch (UsernameNotFoundException e) {
            throw new BadCredentialsException("Invalid Username or Password");
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String jwt) {

        if (jwt == null) {
            throw new MissingRequestHeaderException("Jwt is missing");
        }
        
        String email = JwtProvider.getEmailFromJwt(jwt);

        
        UserDetails userDetails = customUserService.loadUserByUsername(email);

        
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails.getUsername(),
                null,
                userDetails.getAuthorities());

        
        String newToken = JwtProvider.generateToken(authentication);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setStatus(true);
        authResponse.setMessage("Token refreshed successfully");
        authResponse.setJwt(newToken);

        return ResponseEntity.ok(authResponse);

    }

    @GetMapping("user/{userId}")
    public User findUserById(@PathVariable("userId") Integer id) throws Exception {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            return userOptional.get();
        } else {
            throw new Exception("User not found with id: " + id);
        }
    }

    @GetMapping("/{userId}")
    public User findUserByIds(@PathVariable("userId") Integer id) throws Exception {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            return userOptional.get();
        } else {
            throw new Exception("User not found with id: " + id);
        }
    }

    @GetMapping("/email")
    public ResponseEntity<User> getUserByEmail(
            @RequestParam @NotNull @Email(message = "Valid email is required") String email) {

        User user = userRepository.findByEmail(email);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping("/all-users")
    public ResponseEntity<List<User>> getAllUsers() {

        List<User> user = userRepository.findAll();
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PostMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        boolean isAvailable = userService.checkEmailAvailability(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isAvailable", isAvailable);
        return ResponseEntity.ok(response);
    }

    





    @GetMapping("/check-auth-method")
    public ResponseEntity<Map<String, Object>> checkAuthMethod(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        User user = userRepository.findByEmail(email);

        if (user == null) {
            response.put("exists", false);
            return ResponseEntity.ok(response);
        }

        response.put("exists", true);
        response.put("authProvider", user.getAuthProvider());
        response.put("hasPassword", user.getPassword() != null && !user.getPassword().isEmpty());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (userService.findByEmail(email) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Email not found"));
        }
        try {
            String otp = otpService.generateAndSendOtp(email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP sent successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send OTP"));
        }
    }

    @PostMapping("/resend-login-otp")
    public ResponseEntity<Map<String, String>> resendLoginOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Email not found"));
        }

        if (!user.isTwoFactorEnabled()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Two-factor authentication is not enabled for this account"));
        }

        try {
            otpService.generateAndSendLoginOtp(email);
            return ResponseEntity.ok(Map.of("message", "Login OTP resent successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to resend login OTP"));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid or expired OTP"));
        }
    }

    @PatchMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("password");
        User userOptional = userService.findByEmail(email);
        if (userOptional == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Email not found"));
        }
        try {
            
            boolean isOAuthUserCreatingPassword = "GOOGLE".equals(userOptional.getAuthProvider()) &&
                    (userOptional.getPassword() == null || userOptional.getPassword().isEmpty());

            userService.updatePassword(userOptional, newPassword);

            
            String message = isOAuthUserCreatingPassword
                    ? "Password created successfully. You can now login with email and password."
                    : "Password reset successfully";

            return ResponseEntity
                    .ok(Map.of("message", message, "wasPasswordCreation", String.valueOf(isOAuthUserCreatingPassword)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reset password"));
        }
    }

}