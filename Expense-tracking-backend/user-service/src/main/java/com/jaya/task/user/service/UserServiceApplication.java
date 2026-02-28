package com.jaya.task.user.service;

import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication implements CommandLineRunner {

	@Autowired
	private RoleRepository roleRepository;

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

	@Override
	@Transactional
	public void run(String... args) throws Exception {

		if (!roleRepository.existsByName("USER")) {
			roleRepository.save(new Role("USER", "Default user role"));
		} else {
			System.out.println("USER role already exists");
		}

		if (!roleRepository.existsByName("ADMIN")) {
			roleRepository.save(new Role("ADMIN", "Administrator role"));
		} else {
			System.out.println("ADMIN role already exists");
		}

	}
}