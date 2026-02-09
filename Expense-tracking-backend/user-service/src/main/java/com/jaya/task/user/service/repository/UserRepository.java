package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.modal.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

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