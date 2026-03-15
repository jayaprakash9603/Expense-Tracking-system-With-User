package com.jaya.task.user.service.config;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

class JwtProviderTest {

    @Nested
    class GenerateToken {

        @Test
        void generatesNonNullToken() {
            Authentication auth = createAuth("test@example.com", "ROLE_USER");

            String token = JwtProvider.generateToken(auth);

            assertThat(token).isNotNull().isNotBlank();
        }

        @Test
        void generatedTokenContainsThreeParts() {
            Authentication auth = createAuth("test@example.com", "ROLE_USER");

            String token = JwtProvider.generateToken(auth);

            assertThat(token.split("\\.")).hasSize(3);
        }
    }

    @Nested
    class GenerateMfaToken {

        @Test
        void generatesNonNullMfaToken() {
            Authentication auth = createAuth("test@example.com", "ROLE_USER");

            String token = JwtProvider.generateMfaToken(auth);

            assertThat(token).isNotNull().isNotBlank();
        }

        @Test
        void mfaTokenIsFlaggedAsPending() {
            Authentication auth = createAuth("test@example.com", "ROLE_USER");

            String token = JwtProvider.generateMfaToken(auth);

            assertThat(JwtProvider.isMfaPendingToken(token)).isTrue();
        }
    }

    @Nested
    class GetEmailFromJwt {

        @Test
        void extractsEmailFromToken() {
            Authentication auth = createAuth("test@example.com", "ROLE_USER");
            String token = JwtProvider.generateToken(auth);

            String email = JwtProvider.getEmailFromJwt(token);

            assertThat(email).isEqualTo("test@example.com");
        }

        @Test
        void extractsEmailFromTokenWithBearerPrefix() {
            Authentication auth = createAuth("test@example.com", "ROLE_USER");
            String token = "Bearer " + JwtProvider.generateToken(auth);

            String email = JwtProvider.getEmailFromJwt(token);

            assertThat(email).isEqualTo("test@example.com");
        }
    }

    @Nested
    class IsMfaPendingToken {

        @Test
        void returnsTrueForMfaToken() {
            Authentication auth = createAuth("test@example.com", "ROLE_USER");
            String mfaToken = JwtProvider.generateMfaToken(auth);

            assertThat(JwtProvider.isMfaPendingToken(mfaToken)).isTrue();
        }

        @Test
        void returnsFalseForStandardToken() {
            Authentication auth = createAuth("test@example.com", "ROLE_USER");
            String standardToken = JwtProvider.generateToken(auth);

            assertThat(JwtProvider.isMfaPendingToken(standardToken)).isFalse();
        }

        @Test
        void returnsFalseForInvalidToken() {
            assertThat(JwtProvider.isMfaPendingToken("invalid.token.here")).isFalse();
        }

        @Test
        void handlesBearerPrefix() {
            Authentication auth = createAuth("test@example.com", "ROLE_USER");
            String mfaToken = "Bearer " + JwtProvider.generateMfaToken(auth);

            assertThat(JwtProvider.isMfaPendingToken(mfaToken)).isTrue();
        }
    }

    @Nested
    class PopulateAuthorities {

        @Test
        void joinsMultipleAuthorities() {
            List<GrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_USER"),
                    new SimpleGrantedAuthority("ROLE_ADMIN"));

            String result = JwtProvider.populateAuthorities(authorities);

            assertThat(result).contains("ROLE_USER");
            assertThat(result).contains("ROLE_ADMIN");
        }

        @Test
        void handlesSingleAuthority() {
            List<GrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_USER"));

            String result = JwtProvider.populateAuthorities(authorities);

            assertThat(result).isEqualTo("ROLE_USER");
        }
    }

    private Authentication createAuth(String email, String... roles) {
        List<GrantedAuthority> authorities = java.util.Arrays.stream(roles)
                .map(SimpleGrantedAuthority::new)
                .map(a -> (GrantedAuthority) a)
                .toList();
        return new UsernamePasswordAuthenticationToken(email, null, authorities);
    }
}
