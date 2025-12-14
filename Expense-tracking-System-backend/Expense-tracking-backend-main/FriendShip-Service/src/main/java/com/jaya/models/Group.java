package com.jaya.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Entity
@Table(name = "expense_groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    // Avatar emoji or image
    @Column(name = "avatar", length = 16)
    private String avatar;

    @Column(name = "created_by", nullable = false)
    private Integer createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ElementCollection
    @CollectionTable(name = "group_members", joinColumns = @JoinColumn(name = "group_id"))
    @Column(name = "user_id")
    private Set<Integer> memberIds;

    // New: Store user roles as a map (userId -> role)
    @ElementCollection
    @CollectionTable(name = "group_member_roles", joinColumns = @JoinColumn(name = "group_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private Map<Integer, GroupRole> memberRoles = new HashMap<>();

    // New: Store when each member joined
    @ElementCollection
    @CollectionTable(name = "group_member_joined_dates", joinColumns = @JoinColumn(name = "group_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "joined_at")
    private Map<Integer, LocalDateTime> memberJoinedDates = new HashMap<>();

    // New: Store who added each member
    @ElementCollection
    @CollectionTable(name = "group_member_added_by", joinColumns = @JoinColumn(name = "group_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "added_by")
    private Map<Integer, Integer> memberAddedBy = new HashMap<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        // Automatically assign ADMIN role to creator
        if (createdBy != null) {
            if (memberRoles == null) {
                memberRoles = new HashMap<>();
            }
            if (memberJoinedDates == null) {
                memberJoinedDates = new HashMap<>();
            }
            if (memberAddedBy == null) {
                memberAddedBy = new HashMap<>();
            }

            memberRoles.put(createdBy, GroupRole.ADMIN);
            memberJoinedDates.put(createdBy, LocalDateTime.now());
            memberAddedBy.put(createdBy, createdBy);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods for role management
    public GroupRole getUserRole(Integer userId) {
        return memberRoles.getOrDefault(userId, GroupRole.VIEWER);
    }

    public void setUserRole(Integer userId, GroupRole role) {
        if (memberRoles == null) {
            memberRoles = new HashMap<>();
        }
        memberRoles.put(userId, role);
    }

    public boolean hasPermission(Integer userId, String permission) {
        GroupRole role = getUserRole(userId);
        switch (permission.toLowerCase()) {
            case "delete_group":
                return role.canDeleteGroup();
            case "edit_settings":
                return role.canEditGroupSettings();
            case "manage_members":
                return role.canManageMembers();
            case "manage_expenses":
                return role.canManageExpenses();
            case "add_expenses":
                return role.canAddExpenses();
            case "edit_expenses":
                return role.canEditExpenses();
            case "delete_expenses":
                return role.canDeleteExpenses();
            case "view_expenses":
                return role.canViewExpenses();
            case "promote_members":
                return role.canPromoteMembers();
            case "demote_members":
                return role.canDemoteMembers();
            default:
                return false;
        }
    }

    public void addMember(Integer userId, GroupRole role, Integer addedBy) {
        if (memberIds == null) {
            memberIds = new HashSet<>();
        }
        if (memberRoles == null) {
            memberRoles = new HashMap<>();
        }
        if (memberJoinedDates == null) {
            memberJoinedDates = new HashMap<>();
        }
        if (memberAddedBy == null) {
            memberAddedBy = new HashMap<>();
        }
        memberIds.add(userId);
        memberRoles.put(userId, role);
        memberJoinedDates.put(userId, LocalDateTime.now());
        memberAddedBy.put(userId, addedBy);
    }

    public void removeMember(Integer userId) {
        if (memberIds != null) {
            memberIds.remove(userId);
        }
        if (memberRoles != null) {
            memberRoles.remove(userId);
        }
        if (memberJoinedDates != null) {
            memberJoinedDates.remove(userId);
        }
        if (memberAddedBy != null) {
            memberAddedBy.remove(userId);
        }
    }

    public LocalDateTime getMemberJoinedDate(Integer userId) {
        return memberJoinedDates != null ? memberJoinedDates.get(userId) : null;
    }

    public Integer getMemberAddedBy(Integer userId) {
        return memberAddedBy != null ? memberAddedBy.get(userId) : null;
    }
}