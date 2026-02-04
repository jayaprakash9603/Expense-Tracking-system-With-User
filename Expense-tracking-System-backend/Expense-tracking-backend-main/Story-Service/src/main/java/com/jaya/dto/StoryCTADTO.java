package com.jaya.dto;

import com.jaya.models.enums.CTAType;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryCTADTO {
    private UUID id;
    private String label;
    private CTAType ctaType;
    private String actionUrl;
    private String routePath;
    private String actionData;
    private String buttonColor;
    private String textColor;
    private Integer displayOrder;
    private Boolean isPrimary;
}
