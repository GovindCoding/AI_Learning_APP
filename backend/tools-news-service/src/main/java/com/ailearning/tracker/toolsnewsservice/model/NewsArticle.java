package com.ailearning.tracker.toolsnewsservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "news_articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsArticle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String summary;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(nullable = false, length = 100)
    private String source;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "published_date", nullable = false)
    private LocalDateTime publishedDate;

    @Column(name = "article_link", nullable = false)
    private String articleLink;

    private String tags;

    @Column(name = "full_summary", columnDefinition = "TEXT")
    private String fullSummary;

    private String author;

    @Column(name = "fetched_at")
    private LocalDateTime fetchedAt = LocalDateTime.now();

    @Column(name = "ai_company")
    private String aiCompany;

    @Column(name = "related_tools")
    private String relatedTools;

    private String sentiment;

    @Column(name = "popularity_score")
    private Double popularityScore = 0.0;

    @Column(name = "trending_score")
    private Double trendingScore = 0.0;

    @Column(name = "thumbnail_image")
    private String thumbnailImage;

    @Column(name = "article_image")
    private String articleImage;

    private String language = "en";

    private String region = "US";

    @Column(name = "ai_insights", columnDefinition = "TEXT")
    private String aiInsights;

    @Column(name = "duplicate_hash")
    private String duplicateHash;

    @Column(name = "alternative_references", columnDefinition = "TEXT")
    private String alternativeReferences;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
