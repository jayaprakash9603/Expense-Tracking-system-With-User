package com.jaya;

import com.corundumstudio.socketio.SocketIOServer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableCaching
@EnableFeignClients
public class SocialMediaAppApplication {

//	@Autowired
//	private SocketIOServer socketIOServer;

	public static void main(String[] args) {
		SpringApplication.run(SocialMediaAppApplication.class, args);
	}

//	@PostConstruct
//	public void startSocketServer() {
//		socketIOServer.start();
//		System.out.println("Socket server started on port: " + socketIOServer.getConfiguration().getPort());
//	}
//
//	@PreDestroy
//	public void stopSocketServer() {
//		socketIOServer.stop();
//
//	}
}