package com.jaya;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class PaymentMethodServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PaymentMethodServiceApplication.class, args);
	}

}
