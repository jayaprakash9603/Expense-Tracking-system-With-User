package com.jaya;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = {"com.jaya.service", "com.jaya.client"})
public class BillServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BillServiceApplication.class, args);
	}

}
