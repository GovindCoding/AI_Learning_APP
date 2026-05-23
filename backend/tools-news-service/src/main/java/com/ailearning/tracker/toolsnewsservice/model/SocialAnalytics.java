package com.ailearning.tracker.toolsnewsservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "social_analytics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialAnalytics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "post_id")
    private Long postId;

    @Column(length = 50)
    private String platform = "LINKEDIN";

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType; // GENERATED, SHARED, SCHEDULED, DOWNLOADED

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
