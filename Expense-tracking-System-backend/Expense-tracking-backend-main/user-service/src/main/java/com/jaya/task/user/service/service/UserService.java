package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.User;
import org.springframework.http.ResponseEntity;

import java.nio.file.AccessDeniedException;
import java.util.List;

public interface UserService {

    public User getUserProfile(String jwt);

    public List<User>getAllUsers();

    public User getUserByEmail(String email);


    public User updateUser(User user);

    void  deleteUser(Long id) throws AccessDeniedException;



}
