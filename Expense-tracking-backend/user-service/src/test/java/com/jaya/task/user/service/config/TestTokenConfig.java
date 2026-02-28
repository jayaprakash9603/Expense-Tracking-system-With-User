package com.jaya.task.user.service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class TestTokenConfig {

    @Value("${test.jwt.admin-token}")
    private String adminToken;

    @Value("${test.jwt.user-token}")
    private String userToken;

    @Value("${test.user.admin.email}")
    private String adminEmail;

    @Value("${test.user.admin.name}")
    private String adminName;

    @Value("${test.user.regular.email}")
    private String regularUserEmail;

    @Value("${test.user.regular.name}")
    private String regularUserName;

    @Value("${test.endpoints.auth.signup}")
    private String signupEndpoint;

    @Value("${test.endpoints.auth.signin}")
    private String signinEndpoint;

    @Value("${test.endpoints.user.profile}")
    private String userProfileEndpoint;

    @Value("${test.endpoints.user.email}")
    private String userEmailEndpoint;

    @Value("${test.endpoints.user.base}")
    private String userBaseEndpoint;

    @Value("${test.endpoints.admin.users}")
    private String adminUsersEndpoint;

    @Bean
    public TestTokenProvider testTokenProvider() {
        return new TestTokenProvider(
                adminToken, userToken,
                adminEmail, adminName,
                regularUserEmail, regularUserName,
                signupEndpoint, signinEndpoint,
                userProfileEndpoint, userEmailEndpoint,
                userBaseEndpoint, adminUsersEndpoint
        );
    }

    public static class TestTokenProvider {
        private final String adminToken;
        private final String userToken;
        private final String adminEmail;
        private final String adminName;
        private final String regularUserEmail;
        private final String regularUserName;
        private final String signupEndpoint;
        private final String signinEndpoint;
        private final String userProfileEndpoint;
        private final String userEmailEndpoint;
        private final String userBaseEndpoint;
        private final String adminUsersEndpoint;

        public TestTokenProvider(String adminToken, String userToken,
                                 String adminEmail, String adminName,
                                 String regularUserEmail, String regularUserName,
                                 String signupEndpoint, String signinEndpoint,
                                 String userProfileEndpoint, String userEmailEndpoint,
                                 String userBaseEndpoint, String adminUsersEndpoint) {
            this.adminToken = adminToken;
            this.userToken = userToken;
            this.adminEmail = adminEmail;
            this.adminName = adminName;
            this.regularUserEmail = regularUserEmail;
            this.regularUserName = regularUserName;
            this.signupEndpoint = signupEndpoint;
            this.signinEndpoint = signinEndpoint;
            this.userProfileEndpoint = userProfileEndpoint;
            this.userEmailEndpoint = userEmailEndpoint;
            this.userBaseEndpoint = userBaseEndpoint;
            this.adminUsersEndpoint = adminUsersEndpoint;
        }

        
        public String getAdminToken() {
            return "Bearer " + adminToken;
        }

        public String getUserToken() {
            return "Bearer " + userToken;
        }

        public String getAdminTokenWithoutBearer() {
            return adminToken;
        }

        public String getUserTokenWithoutBearer() {
            return userToken;
        }

        
        public String getAdminEmail() {
            return adminEmail;
        }

        public String getAdminName() {
            return adminName;
        }

        public String getRegularUserEmail() {
            return regularUserEmail;
        }

        public String getRegularUserName() {
            return regularUserName;
        }

        
        public String getSignupEndpoint() {
            return signupEndpoint;
        }

        public String getSigninEndpoint() {
            return signinEndpoint;
        }

        public String getUserProfileEndpoint() {
            return userProfileEndpoint;
        }

        public String getUserEmailEndpoint() {
            return userEmailEndpoint;
        }

        public String getUserBaseEndpoint() {
            return userBaseEndpoint;
        }

        public String getAdminUsersEndpoint() {
            return adminUsersEndpoint;
        }

        
        public String getUserByIdEndpoint(Long userId) {
            return userBaseEndpoint + "/" + userId;
        }

        public String getAddRoleEndpoint(Long userId, Long roleId) {
            return userBaseEndpoint + "/" + userId + "/roles/" + roleId;
        }

        public String getRemoveRoleEndpoint(Long userId, Long roleId) {
            return userBaseEndpoint + "/" + userId + "/roles/" + roleId;
        }

        public String getDeleteUserEndpoint(Long userId) {
            return userBaseEndpoint + "/" + userId;
        }
    }
}