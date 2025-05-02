package com.jaya.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.jaya.config.JwtProvider;
import com.jaya.exceptions.UserException;
import com.jaya.models.User;
import com.jaya.repository.UserRepository;

@Service
public class UserServiceImplementation implements UserService {

	
	@Autowired
	UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;
	@Override
	public User registerUser(User user) {
		User newUser=new User();
		newUser.setEmail(user.getEmail());
		newUser.setFirstName(user.getFirstName());
		newUser.setLastName(user.getLastName());
		newUser.setPassword(user.getPassword());
		newUser.setId(user.getId());
		
		User savedUser=userRepository.save(newUser);
		return savedUser;
	}

	@Override
	public User findUserById(Integer userId) throws UserException {
Optional<User> user=userRepository.findById(userId);
		
		
		if(user.isPresent())
		{
			return user.get();
		}
		throw new UserException("user not exist with userid="+userId);
	}

	@Override
	public User findUserByEmail(String email) {
		User user=userRepository.findByEmail(email);
		return user;
	}


	
	@Override
	public User updatedUser(User user, Integer userId) throws UserException {
	    Optional<User> user1 = userRepository.findById(userId);

	    if (user1.isEmpty()) {
	        throw new UserException("User does not exist with id " + userId);
	    }

	    User oldUser = user1.get();

	    if (user.getFirstName() != null) {
	        oldUser.setFirstName(user.getFirstName());
	    }
	    if (user.getLastName() != null) {
	        oldUser.setLastName(user.getLastName());
	    }
	    if (user.getEmail() != null) {
	        oldUser.setEmail(user.getEmail());
	    }
	    if (user.getGender() != null) {
	        oldUser.setGender(user.getGender());
	    }
		if(user.getImage()!=null)
		{
			oldUser.setImage(user.getImage());
		}
		if(user.getBio()!=null)
		{
			oldUser.setBio(user.getBio());
		}
		if(user.getPhoneNumber()!=null)
		{
			oldUser.setPhoneNumber(user.getPhoneNumber());
		}
		if(user.getWebsite()!=null)
		{
			oldUser.setWebsite(user.getWebsite());
		}
		if(user.getUsername()!=null)
		{
			oldUser.setUsername(user.getUsername());
		}
		if(user.getLocation()!=null)
		{
			oldUser.setLocation(user.getLocation());
		}
	    User updatedUser = userRepository.save(oldUser);
	    return updatedUser;
	}


	@Override
	public List<User> searchUser(String query) {
		
		return userRepository.searchUser(query);
	}

	@Override
	public User findUserByJwt(String jwt) {
		String email=JwtProvider.getEmailFromJwtToken(jwt);
		User user=userRepository.findByEmail(email);
		return user;
	}


	@Override
	public boolean checkEmailAvailability(String email) {
		return !userRepository.existsByEmail(email);
	}
@Override
	public User findByEmail(String email) {
		return userRepository.findByEmail(email);
	}
@Override
	public void updatePassword(User user, String newPassword) {
		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
	}
}
