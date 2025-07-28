package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.modal.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "roles")
    User findByEmail(String email);

    // Custom query to fetch user with roles eagerly
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    User findByEmailWithRoles(@Param("email") String email);

    // Custom query to fetch user by ID with roles
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.id = :id")
    User findByIdWithRoles(@Param("id") Long id);

    // Find all users with roles
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles")
    java.util.List<User> findAllWithRoles();
}