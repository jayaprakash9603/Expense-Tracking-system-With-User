package com.jaya;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {
        "com.jaya.feature",
        "com.jaya.security",
        "com.jaya.ratelimit",
        "com.jaya.error",
        "com.jaya.controller"
})
public class GatewayService {

	public static void main(String[] args) {
		SpringApplication.run(GatewayService.class, args);
	}





}
