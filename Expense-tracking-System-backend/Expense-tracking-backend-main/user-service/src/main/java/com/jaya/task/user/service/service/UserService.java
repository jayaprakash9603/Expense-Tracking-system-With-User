package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.request.UserUpdateRequest;
import org.springframework.http.ResponseEntity;

import java.nio.file.AccessDeniedException;
import java.util.List;

public interface UserService {

    public User getUserProfile(String jwt);

    public List<User>getAllUsers();

    public User getUserByEmail(String email);


    public User updateUserProfile(String jwt, UserUpdateRequest updateRequest);

    void  deleteUser(Long id) throws AccessDeniedException;

    public boolean checkEmailAvailability(String email);

    public User findByEmail(String email);

    public void updatePassword(User user, String newPassword);

}
