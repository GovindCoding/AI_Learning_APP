package com.ailearning.tracker.authservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50, unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(name = "icon_name", length = 50, nullable = false)
    private String iconName;

    @Column(name = "xp_requirement", nullable = false)
    private Integer xpRequirement;
}
