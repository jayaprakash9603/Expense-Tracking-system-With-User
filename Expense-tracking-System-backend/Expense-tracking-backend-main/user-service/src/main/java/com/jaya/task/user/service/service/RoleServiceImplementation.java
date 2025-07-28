package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleServiceImplementation implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public Role createRole(Role role) {
        System.out.println("Creating Role: " + role);
        if (existsByName(role.getName())) {
            throw new RuntimeException("Role with name '" + role.getName() + "' already exists");
        }
        return roleRepository.save(role);
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Optional<Role> getRoleById(Long id) {
        return roleRepository.findById(id);
    }

    @Override
    public Optional<Role> getRoleByName(String name) {
        return roleRepository.findByName(name);
    }

    @Override
    public Role updateRole(Long id, Role role) {
        Optional<Role> existingRole = roleRepository.findById(id);
        if (existingRole.isPresent()) {
            Role roleToUpdate = existingRole.get();
            roleToUpdate.setName(role.getName());
            roleToUpdate.setDescription(role.getDescription());
            return roleRepository.save(roleToUpdate);
        }
        throw new RuntimeException("Role not found with id: " + id);
    }

    @Override
    public void deleteRole(Long id) {
        if (roleRepository.existsById(id)) {
            roleRepository.deleteById(id);
        } else {
            throw new RuntimeException("Role not found with id: " + id);
        }
    }

    @Override
    public boolean existsByName(String name) {
        return roleRepository.existsByName(name);
    }
}