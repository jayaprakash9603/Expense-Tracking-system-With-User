package com.jaya;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class FriendShipServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FriendShipServiceApplication.class, args);
	}

}
