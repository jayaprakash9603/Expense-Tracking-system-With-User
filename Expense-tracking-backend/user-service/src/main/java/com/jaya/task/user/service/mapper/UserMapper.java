package com.jaya.task.user.service.mapper;

import com.jaya.common.dto.UserDTO;
import com.jaya.task.user.service.modal.AccountStatus;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.util.ProfileImageResolver;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) return null;

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setLastName(user.getLastName());
        dto.setFirstName(user.getFirstName());
        dto.setRoles(user.getRoles());
        dto.setCurrentMode(user.getCurrentMode());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        if (user.getAccountStatus() != null) {
            dto.setAccountStatus(user.getAccountStatus().name());
            dto.setDeletionPending(user.getAccountStatus() == AccountStatus.DELETION_PENDING);
        }
        dto.setDeletionScheduledPurgeAt(user.getDeletionScheduledPurgeAt());
        dto.setImage(ProfileImageResolver.resolveDisplayImage(user));
        dto.setCoverImage(user.getCoverImage());
        dto.setFullName(user.getFullName());
        dto.setMobile(user.getMobile());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setLocation(user.getLocation());
        dto.setBio(user.getBio());
        dto.setGender(user.getGender());
        dto.setAuthProvider(user.getAuthProvider());

        return dto;
    }

    public User toEntity(UserDTO dto) {
        if (dto == null) return null;

        User user = new User();
        user.setId(dto.getId());
        user.setEmail(dto.getEmail());
        user.setRoles(dto.getRoles());
        user.setCurrentMode(dto.getCurrentMode());
        user.setCreatedAt(dto.getCreatedAt());
        user.setUpdatedAt(dto.getUpdatedAt());
        // Do not set password or sensitive fields from DTO

        return user;
    }
}