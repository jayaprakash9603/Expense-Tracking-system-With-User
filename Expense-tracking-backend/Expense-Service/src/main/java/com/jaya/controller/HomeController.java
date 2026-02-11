package com.jaya.controller;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

	@Autowired
	private IUserServiceClient IUserServiceClient;
	
	@GetMapping
	public String homeControllerHandler()
	{
		return "this is home controller";
	}
	
	@GetMapping("/home")
	public String homeControllerHandler2()
	{
		return "this is home controller 2";
	}

	@GetMapping("/test")
	public UserDTO testuserlogin(@RequestHeader("Authorization") String jwt) {
		UserDTO UserDTO = IUserServiceClient.getUserProfile(jwt);
		return UserDTO;
	}
}

