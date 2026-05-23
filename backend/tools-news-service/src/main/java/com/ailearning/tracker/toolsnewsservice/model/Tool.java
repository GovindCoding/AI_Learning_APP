package com.ailearning.tracker.toolsnewsservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_tools")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tool {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "website_link", nullable = false)
    private String websiteLink;

    @Column(name = "chatbot_link")
    private String chatbotLink;

    @Column(name = "playground_link")
    private String playgroundLink;

    @Column(name = "api_docs_link")
    private String apiDocsLink;

    @Column(nullable = false, length = 20)
    private String pricing = "FREE"; // FREE, PAID, FREEMIUM, OPEN_SOURCE

    @Column(columnDefinition = "TEXT")
    private String features;

    private String tags;

    @Column(name = "popularity_score")
    private Double popularityScore = 0.0;

    @Column(name = "community_rating")
    private Double communityRating = 0.0;

    @Column(name = "github_link")
    private String githubLink;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
