package com.jaya.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jaya.models.User;

public interface UserRepository extends JpaRepository<User, Integer>{

	
	public User findByEmail(String email);
	
	@Query("select u from User u where u.firstName LIKE %:query% OR u.lastName LIKE %:query% OR u.email LIKE %:query%")
	public List<User> searchUser(@Param("query") String query);


	boolean existsByEmail(String email);
}
