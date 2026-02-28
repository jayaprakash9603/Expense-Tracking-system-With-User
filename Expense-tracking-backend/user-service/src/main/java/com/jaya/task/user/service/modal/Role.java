package com.jaya.task.user.service.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "users")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Role name is mandatory")
    @Size(min = 2, max = 50, message = "Role name must be between 2 and 50 characters")
    @Column(unique = true, nullable = false)
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @PastOrPresent(message = "Created date cannot be in the future")
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PastOrPresent(message = "Updated date cannot be in the future")
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "user_ids", columnDefinition = "LONGBLOB")
    private Set<Integer> users;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (name != null) {
            name = name.toUpperCase().trim();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (name != null) {
            name = name.toUpperCase().trim();
        }
    }

    public Role(String name, String description) {
        this.name = name != null ? name.toUpperCase().trim() : null;
        this.description = description;
    }
}