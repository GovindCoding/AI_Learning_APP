package com.ailearning.tracker.toolsnewsservice.repository;

import com.ailearning.tracker.toolsnewsservice.model.SocialAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SocialAnalyticsRepository extends JpaRepository<SocialAnalytics, Long> {
    List<SocialAnalytics> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndActionType(Long userId, String actionType);
}
