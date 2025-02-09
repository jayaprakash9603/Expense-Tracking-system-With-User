package com.jaya.service;

import java.util.List;

import com.jaya.exceptions.UserException;
import com.jaya.models.User;

public interface UserService {
public User registerUser(User user);
public User findUserById(Integer userId) throws UserException;
public User findUserByEmail(String email);



public User updatedUser(User user,Integer userId) throws UserException;

public List<User>searchUser(String query);


public User findUserByJwt(String jwt);
}
