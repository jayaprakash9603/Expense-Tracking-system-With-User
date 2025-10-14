package com.jaya.task.user.service.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Enable @PreAuthorize annotations
public class ApplicationConfiguration {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .sessionManagement(management ->
                        management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize ->
                        authorize
                                // Public endpoints (auth endpoints)
                                .requestMatchers("/auth/**").permitAll()

                                // Admin-only endpoints
                                .requestMatchers("/api/user/*/roles").hasRole("ADMIN")
                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                // General authenticated endpoints
                                .requestMatchers("/api/user/profile").authenticated()
                                .requestMatchers("/api/user/debug").authenticated()
                                .requestMatchers("/api/**").authenticated()

                                // Everything else is permitted
                                .anyRequest().permitAll())
                .addFilterBefore(new JwtTokenValidator(), BasicAuthenticationFilter.class)
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .httpBasic(Customizer.withDefaults())
                .formLogin(Customizer.withDefaults());

        return http.build();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        return new CorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                CorsConfiguration cfg = new CorsConfiguration();
                String origin = request.getHeader("Origin");

                if (origin != null) {
                    // Use allowedOriginPatterns instead of allowedOrigins when allowCredentials is true
                    cfg.setAllowedOriginPatterns(Arrays.asList(origin));
                } else {
                    // For development, allow common localhost patterns
                    cfg.setAllowedOriginPatterns(Arrays.asList(
                            "http://localhost:*",
                            "https://localhost:*",
                            "http://127.0.0.1:*",
                            "https://127.0.0.1:*"
                    ));
                }

                // Include PATCH (needed for reset-password) and HEAD for completeness
                cfg.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE"));
                cfg.setAllowedHeaders(Collections.singletonList("*"));
                cfg.setExposedHeaders(Arrays.asList("Authorization"));
                cfg.setMaxAge(3600L);
                cfg.setAllowCredentials(true);
                return cfg;
            }
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}