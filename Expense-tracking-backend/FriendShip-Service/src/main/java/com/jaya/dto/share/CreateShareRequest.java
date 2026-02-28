package com.jaya.dto.share;

import com.jaya.models.SharePermission;
import com.jaya.models.SharedResourceType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShareRequest {

    @NotNull(message = "Resource type is required")
    private SharedResourceType resourceType;

    @NotEmpty(message = "At least one resource reference is required")
    @Valid
    private List<ResourceRefDTO> resourceRefs;

    @NotNull(message = "Permission is required")
    private SharePermission permission;

    private Integer expiryDays;

    private LocalDateTime customExpiry;

    @Size(max = 255, message = "Share name cannot exceed 255 characters")
    private String shareName;

    private String visibility;

    private List<Integer> allowedUserIds;

    public LocalDateTime calculateExpiresAt() {
        if (customExpiry != null) {
            return customExpiry;
        }
        if (expiryDays != null && expiryDays > 0) {
            return LocalDateTime.now().plusDays(expiryDays);
        }
        return LocalDateTime.now().plusDays(7);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResourceRefDTO {
        @NotBlank(message = "Resource type is required")
        private String type;

        private Integer internalId;

        @NotBlank(message = "External reference is required")
        private String externalRef;

        private String displayName;
    }
}
