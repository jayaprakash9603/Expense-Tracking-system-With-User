package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.request.RoleRequest;
import com.jaya.task.user.service.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createRole(
            @Valid @RequestBody RoleRequest roleRequest,
            @RequestHeader("Authorization") String jwt) {

        try {
            Role role = new Role(
                    roleRequest.getName() != null ? roleRequest.getName().toUpperCase().trim() : null,
                    roleRequest.getDescription()
            );
            Role createdRole = roleService.createRole(role);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body( createdRole
                    );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create role: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Role>> getAllRoles(@RequestHeader("Authorization") String jwt) {
        List<Role> roles = roleService.getAllRoles();
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> getRoleById(@PathVariable Integer id, @RequestHeader("Authorization") String jwt) {
        Optional<Role> role = roleService.getRoleById(id);
        return role.map(r -> new ResponseEntity<>(r, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> getRoleByName(@PathVariable String name, @RequestHeader("Authorization") String jwt) {
        Optional<Role> role = roleService.getRoleByName(name);
        return role.map(r -> new ResponseEntity<>(r, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(
            @PathVariable Integer id,
            @Valid @RequestBody RoleRequest roleRequest,
            @RequestHeader("Authorization") String jwt) {
        try {
            Role role = new Role(
                    roleRequest.getName() != null ? roleRequest.getName().toUpperCase().trim() : null,
                    roleRequest.getDescription()
            );
            Role updatedRole = roleService.updateRole(id, role);
            return new ResponseEntity<>(updatedRole, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteRole(@PathVariable Integer id, @RequestHeader("Authorization") String jwt) {
        try {
            roleService.deleteRole(id);
            return new ResponseEntity<>("Role deleted successfully", HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Role not found", HttpStatus.NOT_FOUND);
        }
    }
}