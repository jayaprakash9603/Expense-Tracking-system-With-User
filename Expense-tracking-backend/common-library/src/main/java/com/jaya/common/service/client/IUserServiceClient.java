package com.jaya.common.service.client;

import com.jaya.common.dto.UserDTO;

import java.util.List;

/**
 * Interface for User Service client operations.
 * Implementations:
 * - FeignUserServiceClient: @Profile("!monolithic") - calls remote USER-SERVICE
 * - LocalUserServiceClient: @Profile("monolithic") - calls UserService bean directly
 */
public interface IUserServiceClient {

    /**
     * Get user profile by JWT token.
     *
     * @param jwt the authorization JWT token
     * @return the user profile
     */
    UserDTO getUserProfile(String jwt);

    /**
     * Get user by ID.
     *
     * @param userId the user ID
     * @return the user profile
     */
    UserDTO getUserById(Integer userId);

    /**
     * Get all users.
     *
     * @return list of all users
     */
    List<UserDTO> getAllUsers();

    /**
     * Find user by email.
     *
     * @param email the email address
     * @return the user profile
     */
    UserDTO findUserByEmail(String email);
}
