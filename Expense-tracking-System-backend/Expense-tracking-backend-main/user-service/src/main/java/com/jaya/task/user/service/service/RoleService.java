package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.Role;
import java.util.List;
import java.util.Optional;

public interface RoleService {
    Role createRole(Role role);
    List<Role> getAllRoles();
    Optional<Role> getRoleById(Long id);
    Optional<Role> getRoleByName(String name);
    Role updateRole(Long id, Role role);
    void deleteRole(Long id);
    boolean existsByName(String name);
}