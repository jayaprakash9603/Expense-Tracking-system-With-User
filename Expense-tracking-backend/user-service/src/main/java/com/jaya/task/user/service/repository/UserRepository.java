package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.modal.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    @Modifying
    @Query("UPDATE User u SET u.currentMode = :mode, u.updatedAt = :now WHERE u.id = :id")
    int updateCurrentMode(@Param("id") Integer id, @Param("mode") String mode, @Param("now") LocalDateTime now);

    @EntityGraph(attributePaths = "roles")
    User findByEmail(String email);

    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    User findByEmailWithRoles(@Param("email") String email);

    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.id = :id")
    User findByIdWithRoles(@Param("id") Integer id);

    
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles")
    java.util.List<User> findAllWithRoles();


    boolean existsByEmail(String email);
}