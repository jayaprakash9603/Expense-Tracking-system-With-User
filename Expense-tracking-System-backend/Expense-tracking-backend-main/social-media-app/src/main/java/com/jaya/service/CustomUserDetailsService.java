//package com.jaya.service;
//
//import java.util.ArrayList;
//import java.util.List;
//
//import com.jaya.dto.User;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//@Service
//public class CustomUserDetailsService implements UserDetailsService {
//
//    @Autowired
//    private UserService userService;
//
//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        User user = userService.findUserByEmail(username);
//
//        if (user == null) {
//            throw new UsernameNotFoundException("User not found with email: " + username);
//        }
//
//        List<GrantedAuthority> authorities = new ArrayList<>();
//
//        // Add default role if no specific roles are defined
//        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
//
//
//
//        return new org.springframework.security.core.userdetails.User(
//                user.getEmail(),
//                user.getPassword() != null ? user.getPassword() : "", // Use actual password
//                authorities
//        );
//    }
//}