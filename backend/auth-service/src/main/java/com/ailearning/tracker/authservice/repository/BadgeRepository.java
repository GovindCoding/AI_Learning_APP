package com.ailearning.tracker.authservice.repository;

import com.ailearning.tracker.authservice.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Integer> {
    @Query("SELECT b FROM Badge b WHERE b.xpRequirement <= :xp")
    List<Badge> findEarnedBadges(Integer xp);
}
