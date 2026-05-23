package com.ailearning.tracker.toolsnewsservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "social_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "brand_colors", length = 100)
    private String brandColors = "#0284c7,#6366f1";

    @Column(name = "personal_logo", columnDefinition = "TEXT")
    private String personalLogo;

    @Column(name = "name_signature", length = 100)
    private String nameSignature;

    @Column(name = "writing_tone", length = 50)
    private String writingTone = "Professional";

    @Column(name = "preferred_hashtags")
    private String preferredHashtags = "#AI #Tech";

    @Column(name = "image_template", length = 50)
    private String imageTemplate = "Modern Gradient";

    @Column(name = "watermark_text", length = 100)
    private String watermarkText;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
