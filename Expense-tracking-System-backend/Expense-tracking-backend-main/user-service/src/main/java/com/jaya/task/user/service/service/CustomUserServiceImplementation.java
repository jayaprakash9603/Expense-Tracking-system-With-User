package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserServiceImplementation implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();

        Set<String> userRoles = user.getRoles();
        if (userRoles != null && !userRoles.isEmpty()) {
            for (String roleName : userRoles) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName.toUpperCase().trim()));
                System.out.println("Added authority: ROLE_" + roleName.toUpperCase().trim());
            }
        } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            System.out.println("User " + username + " assigned default role: ROLE_USER");
        }

        System.out.println("User " + username + " has authorities: " + authorities);

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}