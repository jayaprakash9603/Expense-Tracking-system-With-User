package com.jaya.task.user.service;

import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootApplication
public class UserServiceApplication implements CommandLineRunner {

	@Autowired
	private RoleRepository roleRepository;

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

	@Override
	@Transactional
	public void run(String... args) throws Exception {
		// Initialize default roles if they don't exist
		if (!roleRepository.existsByName("USER")) {
			Role userRole = roleRepository.save(new Role("USER", "Default user role"));
			System.out.println("Created default USER role with ID: " + userRole.getId());
		} else {
			System.out.println("USER role already exists");
		}

		if (!roleRepository.existsByName("ADMIN")) {
			Role adminRole = roleRepository.save(new Role("ADMIN", "Administrator role"));
			System.out.println("Created default ADMIN role with ID: " + adminRole.getId());
		} else {
			System.out.println("ADMIN role already exists");
		}

		// Print all existing roles safely
		List<Role> roles = roleRepository.findAll();
		System.out.println("Available roles:");
		for (Role role : roles) {
			System.out.println("- ID: " + role.getId() + ", Name: " + role.getName() + ", Description: " + role.getDescription());
		}

		System.out.println("Total roles count: " + roles.size());
	}
}