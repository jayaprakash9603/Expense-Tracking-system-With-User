package com.jaya.models;

import com.jaya.models.enums.CTAType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;





@Entity
@Table(name = "story_cta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryCTA {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @Column(nullable = false, length = 100)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "cta_type", nullable = false)
    private CTAType ctaType;

    
    @Column(name = "action_url", length = 500)
    private String actionUrl;

    
    @Column(name = "route_path", length = 200)
    private String routePath;

    
    @Column(name = "action_data", columnDefinition = "JSON")
    private String actionData;

    
    @Column(name = "button_color", length = 20)
    private String buttonColor;

    @Column(name = "text_color", length = 20)
    private String textColor;

    
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    
    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;
}
