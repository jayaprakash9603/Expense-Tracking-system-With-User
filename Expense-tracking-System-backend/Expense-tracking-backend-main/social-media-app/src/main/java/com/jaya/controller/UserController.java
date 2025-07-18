package com.jaya.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jaya.exceptions.UserException;
import com.jaya.models.User;
import com.jaya.repository.UserRepository;
import com.jaya.service.UserService;

@RestController
public class UserController {

	@Autowired
	UserRepository userRepository;
	@Autowired
	UserService userService;
	
	
	
	@GetMapping("/users")
	public List<User> getUsers()
	{
		List<User> users=userRepository.findAll();
		
		return users;
	}
	@GetMapping("/api/users/{userId}")
	public User getUserById(@PathVariable("userId") Integer id,@RequestHeader("Authorization")String jwt,@RequestParam(required = false)Integer targetId) throws UserException
	{
		User reqUser=userService.findUserByJwt(jwt);
		if(reqUser.getId()!=id)
		{
			throw new UserException("user not exist with id"+id);
		}
		User user=userService.findUserById(id);
		return user;
	}

	@GetMapping("/{userId}")
	public User getUserProfileById(@PathVariable("userId") Integer id) throws UserException
	{
		User reqUser=userRepository.findById(id).get();
		if(reqUser.getId()!=id)
		{
			throw new UserException("user not exist with id"+id);
		}
		User user=userService.findUserById(id);
		return user;
	}
	
	
	@PutMapping("/api/users")
	public User updateUser(@RequestBody User user,@RequestHeader("Authorization") String jwt) throws UserException
	{
		User reqUser=userService.findUserByJwt(jwt);
		User updatedUser =userService.updatedUser(user, reqUser.getId());
		return updatedUser;
	}
	

	
	@GetMapping("/api/users/profile")
	public User getUserFromToken(@RequestHeader("Authorization") String jwt) throws UserException
	{
		User reqUser=userService.findUserByJwt(jwt);

		User user=userService.findUserById(reqUser.getId());
		return user;
	}
	
	@DeleteMapping("users/{userId}")
	public String deleteUser(@PathVariable Integer userId) throws UserException
	{
		Optional<User> user1=userRepository.findById(userId);
		if(user1.isEmpty())
		{
			throw new UserException	("user not exist with id"+userId);
		}
		userRepository.delete(user1.get());
		return "user deleted successfully with id="+userId;
	}
}
