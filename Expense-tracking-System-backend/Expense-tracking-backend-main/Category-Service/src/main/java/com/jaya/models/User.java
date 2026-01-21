
package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.HashSet;
import java.util.Set;

@JsonIgnoreProperties(ignoreUnknown = true)
public class User {

    @JsonProperty("id")
    private Integer id;

    @JsonProperty("username")
    private String username;

    @JsonProperty("email")
    private String email;

    @JsonProperty("firstName")
    private String firstName;

    @JsonProperty("lastName")
    private String lastName;

    @JsonProperty("profileImage")
    private String image;

    @JsonProperty("mobile")
    private String mobile;

    @JsonProperty("roles")
    private Set<String> roles = new HashSet<>();

    @JsonProperty("currentMode")
    private String currentMode = "USER";

    // Default constructor (required for JSON deserialization)
    public User() {
    }

    // Constructor with parameters
    public User(Integer id, String username, String email, String firstName, String lastName) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public String getCurrentMode() {
        return currentMode;
    }

    public void setCurrentMode(String currentMode) {
        this.currentMode = currentMode;
    }

    /**
     * Check if user has ADMIN role
     */
    public boolean hasAdminRole() {
        if (roles == null)
            return false;
        return roles.stream().anyMatch(role -> role.equalsIgnoreCase("ADMIN") ||
                role.equalsIgnoreCase("ROLE_ADMIN"));
    }

    /**
     * Check if user is currently in ADMIN mode and has ADMIN role
     */
    public boolean isInAdminMode() {
        return hasAdminRole() && "ADMIN".equalsIgnoreCase(currentMode);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", image='" + image + '\'' +
                ", mobile='" + mobile + '\'' +
                ", roles=" + roles +
                ", currentMode='" + currentMode + '\'' +
                '}';
    }
}