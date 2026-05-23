package com.ailearning.tracker.learningservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(
    name = "daily_logs",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "log_date"})}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "hours_learned")
    private Double hoursLearned = 0.0;

    @Column(name = "nodes_completed")
    private Integer nodesCompleted = 0;

    @Column(name = "xp_gained")
    private Integer xpGained = 0;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
