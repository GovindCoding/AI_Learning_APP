package com.ailearning.tracker.toolsnewsservice.repository;

import com.ailearning.tracker.toolsnewsservice.model.SocialDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SocialDraftRepository extends JpaRepository<SocialDraft, Long> {
    List<SocialDraft> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<SocialDraft> findByUserIdAndStatusOrderByScheduledTimeAsc(Long userId, String status);
}
