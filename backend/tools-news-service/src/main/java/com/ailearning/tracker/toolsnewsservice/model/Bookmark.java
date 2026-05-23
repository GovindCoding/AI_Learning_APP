package com.ailearning.tracker.toolsnewsservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "bookmarks",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "item_type", "item_id"})}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bookmark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "item_type", nullable = false, length = 10)
    private String itemType; // TOOL or NEWS

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "saved_at")
    private LocalDateTime savedAt = LocalDateTime.now();
}
