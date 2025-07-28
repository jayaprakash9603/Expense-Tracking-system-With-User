//package com.jaya.controller;
//
//import com.jaya.service.OtpService;
//import com.jaya.service.UserServices;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.authentication.BadCredentialsException;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.web.bind.annotation.*;
//
//import com.jaya.config.JwtProvider;
//import com.jaya.models.User;
//import com.jaya.repository.UserRepository;
//import com.jaya.request.LoginRequest;
//import com.jaya.response.AuthResponse;
//import com.jaya.service.CustomUserDetailsService;
//import com.jaya.service.UserServices;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/auth")
//public class AuthController {
//
//	@Autowired
//	private UserServices userService;
//
//	@Autowired
//	private UserRepository userRepository;
//
//	@Autowired
//	private PasswordEncoder passwordEncoder;
//
//
//	@Autowired
//	private CustomUserDetailsService customUserDetailsService;
//	@PostMapping("/signup")
//	public AuthResponse createUser(@RequestBody User user) throws Exception
//	{
//		User isExist=userRepository.findByEmail(user.getEmail());
//		if(isExist!=null)
//		{
//			throw new Exception("email already used with another account");
//		}
//
//
//		User newUser=new User();
//		newUser.setEmail(user.getEmail());
//		newUser.setFirstName(user.getFirstName());
//		newUser.setLastName(user.getLastName());
//		newUser.setPassword(passwordEncoder.encode(user.getPassword()));
//
//		newUser.setGender(user.getGender());
////		User saved
//		User savedUser=userRepository.save(newUser);
//		Authentication authentication=new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());
//
//
//		String token=JwtProvider.generateToken(authentication);
//
//		AuthResponse res=new AuthResponse(token,"Register Success");
//		return res;
//	}
//
//
//	@PostMapping("/signin")
//	public AuthResponse signin(@RequestBody LoginRequest loginRequest)
//	{
//		Authentication authentication=authenticate(loginRequest.getEmail(),loginRequest.getPassword());
//String token=JwtProvider.generateToken(authentication);
//
//		AuthResponse res=new AuthResponse(token,"Login Success");
//		return res;
//	}
//
//
//
//	private Authentication authenticate(String email, String password) {
//		UserDetails userDetails =customUserDetailsService.loadUserByUsername(email);
//		if(userDetails==null)
//		{
//			throw new BadCredentialsException("invalid username");
//		}
//
//		if(!passwordEncoder.matches(password, userDetails.getPassword()))
//		{
//			throw new BadCredentialsException("password not matcheed");
//		}
//		return new UsernamePasswordAuthenticationToken(userDetails,
//				null,userDetails.getAuthorities());
//
//	}
//
//
//	@Autowired
//	private OtpService otpService;
//
//	@PostMapping("/check-email")
//	public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestBody Map<String, String> request) {
//		String email = request.get("email");
//		boolean isAvailable = userService.checkEmailAvailability(email);
//		Map<String, Boolean> response = new HashMap<>();
//		response.put("isAvailable", isAvailable);
//		return ResponseEntity.ok(response);
//	}
//
//	@PostMapping("/send-otp")
//	public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> request) {
//		String email = request.get("email");
//		if (userService.findByEmail(email)==null) {
//			return ResponseEntity.status(HttpStatus.NOT_FOUND)
//					.body(Map.of("error", "Email not found"));
//		}
//		try {
//			String otp = otpService.generateAndSendOtp(email);
//			Map<String, String> response = new HashMap<>();
//			response.put("message", "OTP sent successfully");
//			response.put("otp", otp); // Include OTP in response for testing
//			return ResponseEntity.ok(response);
//		} catch (Exception e) {
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//					.body(Map.of("error", "Failed to send OTP"));
//		}
//	}
//
//	@PostMapping("/verify-otp")
//	public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> request) {
//		String email = request.get("email");
//		String otp = request.get("otp");
//		boolean isValid = otpService.verifyOtp(email, otp);
//		if (isValid) {
//			return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
//		} else {
//			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//					.body(Map.of("error", "Invalid or expired OTP"));
//		}
//	}
//
//	@PatchMapping("/reset-password")
//	public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
//		String email = request.get("email");
//		String newPassword = request.get("password");
//		User userOptional = userService.findByEmail(email);
//		if (userOptional==null) {
//			return ResponseEntity.status(HttpStatus.NOT_FOUND)
//					.body(Map.of("error", "Email not found"));
//		}
//		try {
//			userService.updatePassword(userOptional, newPassword);
//			return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
//		} catch (Exception e) {
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//					.body(Map.of("error", "Failed to reset password"));
//		}
//	}
//
//}
