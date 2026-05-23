package com.ailearning.tracker.toolsnewsservice.repository;

import com.ailearning.tracker.toolsnewsservice.model.SocialSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SocialSettingsRepository extends JpaRepository<SocialSettings, Long> {
    Optional<SocialSettings> findByUserId(Long userId);
}
