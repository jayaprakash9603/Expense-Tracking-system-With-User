package com.jaya.task.user.service.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class ApplicationConfiguration {

    private static final String DEFAULT_ORIGIN_PATTERNS =
            "http://localhost:*,https://localhost:*,http://127.0.0.1:*,https://127.0.0.1:*,"
                    + "https://jayaprakash.netlify.app,https://jjayaprakash.netlify.app";

    private static final AuthenticationEntryPoint UNAUTHENTICATED_JSON = (request, response, authException) -> {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"error\":\"Unauthorized\"}");
    };

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private Environment environment;

    @Autowired(required = false)
    private AuthRateLimitFilter authRateLimitFilter;

    @Autowired
    private JwtTokenValidator jwtTokenValidator;

    @Autowired
    private DeletionAccessBlockFilter deletionAccessBlockFilter;

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/config/features").permitAll()
                        // SockJS/STOMP handshake endpoints (JWT is validated after CONNECT)
                        .requestMatchers("/notifications/**", "/chat/**", "/ws-stories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/user/all")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/user/*/roles").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/internal/**").hasAuthority("ROLE_SERVICE")
                        .requestMatchers("/api/user/me/deletion-request/**").authenticated()
                        .requestMatchers("/api/user/profile").authenticated()
                        .requestMatchers("/api/user/debug").authenticated()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().denyAll());
        http.addFilterBefore(jwtTokenValidator, BasicAuthenticationFilter.class);
        http.addFilterAfter(deletionAccessBlockFilter, BasicAuthenticationFilter.class);
        if (authRateLimitFilter != null) {
            http.addFilterBefore(authRateLimitFilter, BasicAuthenticationFilter.class);
        }
        http.exceptionHandling(ex -> ex.authenticationEntryPoint(UNAUTHENTICATED_JSON))
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()));

        return http.build();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration cfg = new CorsConfiguration();
            String raw = environment.getProperty("ALLOWED_ORIGIN_PATTERNS", DEFAULT_ORIGIN_PATTERNS);
            List<String> patterns = Stream.of(raw.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            cfg.setAllowedOriginPatterns(patterns);
            cfg.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
            cfg.setAllowedHeaders(Collections.singletonList("*"));
            cfg.setExposedHeaders(Arrays.asList("Authorization"));
            cfg.setMaxAge(3600L);
            cfg.setAllowCredentials(true);
            return cfg;
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate template = new RestTemplate();
        template.getInterceptors().add((request, body, execution) -> {
            jakarta.servlet.http.HttpServletRequest servletRequest =
                    ((org.springframework.web.context.request.ServletRequestAttributes)
                                    org.springframework.web.context.request.RequestContextHolder.getRequestAttributes())
                            .getRequest();
            String auth = servletRequest.getHeader("Authorization");
            if (auth != null) {
                request.getHeaders().set("Authorization", auth);
            }
            return execution.execute(request, body);
        });
        return template;
    }
}
