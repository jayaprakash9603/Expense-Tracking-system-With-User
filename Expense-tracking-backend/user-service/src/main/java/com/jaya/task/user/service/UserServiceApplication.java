package com.jaya.task.user.service;

import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.repository.RoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.Transactional;

@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
@Slf4j
public class UserServiceApplication implements CommandLineRunner {

	@Autowired
	private RoleRepository roleRepository;

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

	@Override
	@Transactional
	public void run(String... args) {
		if (!roleRepository.existsByName("USER")) {
			roleRepository.save(new Role("USER", "Default user role"));
		} else {
			log.info("USER role already exists");
		}

		if (!roleRepository.existsByName("ADMIN")) {
			roleRepository.save(new Role("ADMIN", "Administrator role"));
		} else {
			log.info("ADMIN role already exists");
		}
	}
}
