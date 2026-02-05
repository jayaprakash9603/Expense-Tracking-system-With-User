package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Objects;

@Service
public class RoleServiceImplementation implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public Role createRole(Role role) {
        System.out.println("Creating Role: " + role);

        
        if (role == null || !hasText(role.getName())) {
            throw new RuntimeException("Role name is required");
        }

        
        final String sanitizedName = normalizeName(role.getName());
        final String sanitizedDescription = normalizeDescription(role.getDescription());

        
        assertUniqueNameForCreate(sanitizedName);

        
        Role toSave = new Role();
        toSave.setName(sanitizedName);
        toSave.setDescription(sanitizedDescription);
        return roleRepository.save(toSave);
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Optional<Role> getRoleById(Integer id) {
        return roleRepository.findById(id);
    }

    @Override
    public Optional<Role> getRoleByName(String name) {
        return hasText(name) ? roleRepository.findByName(normalizeName(name)) : Optional.empty();
    }

    @Override
    public Role updateRole(Integer id, Role role) {
        if (id == null) {
            throw new RuntimeException("Role id is required for update");
        }
        Role existing = getExistingRoleOrThrow(id);

        
        if (role == null) {
            return existing;
        }

        
        final String newName = role.getName() != null ? normalizeName(role.getName()) : null;
        final String newDescription = role.getDescription() != null ? normalizeDescription(role.getDescription()) : null;

        
        if (hasText(newName) && !Objects.equals(newName, existing.getName())) {
            assertUniqueNameForUpdate(id, newName);
            existing.setName(newName);
        }

        
        if (role.getDescription() != null) {
            existing.setDescription(newDescription);
        }

        return roleRepository.save(existing);
    }

    @Override
    public void deleteRole(Integer id) {
        if (id != null && roleRepository.existsById(id)) {
            roleRepository.deleteById(id);
        } else {
            throw new RuntimeException("Role not found with id: " + id);
        }
    }

    @Override
    public boolean existsByName(String name) {
        return hasText(name) && roleRepository.existsByName(normalizeName(name));
    }

    

    private Role getExistingRoleOrThrow(Integer id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
    }

    private void assertUniqueNameForCreate(String name) {
        if (existsByName(name)) {
            throw new RuntimeException("Role with name '" + name + "' already exists");
        }
    }

    private void assertUniqueNameForUpdate(Integer id, String name) {
        Optional<Role> byName = getRoleByName(name);
        if (byName.isPresent() && !Objects.equals(byName.get().getId(), id)) {
            throw new RuntimeException("Role with name '" + name + "' already exists");
        }
    }

    

    
    private static boolean hasText(String s) {
        return s != null && !s.trim().isEmpty();
    }

    
    private static String trim(String s) {
        return s == null ? null : s.trim();
    }

    
    private static String normalizeName(String name) {
        return trim(name);
    }

    
    private static String normalizeDescription(String description) {
        return trim(description);
    }
}