package com.ailearning.tracker.learningservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "roadmaps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Roadmap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "skill_level", length = 20, nullable = false)
    private String skillLevel;

    @Column(length = 30, nullable = false)
    private String background;

    @Column(length = 30, nullable = false)
    private String goal;

    @Column(name = "target_hours_per_day")
    private Double targetHoursPerDay = 1.0;

    @Column(name = "learning_style", length = 20, nullable = false)
    private String learningStyle;

    @Column(name = "estimated_completion_weeks")
    private Integer estimatedCompletionWeeks = 12;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "roadmap", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LearningNode> nodes = new ArrayList<>();
}
