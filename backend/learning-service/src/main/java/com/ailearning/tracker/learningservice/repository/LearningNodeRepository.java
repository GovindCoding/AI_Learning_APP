package com.ailearning.tracker.learningservice.repository;

import com.ailearning.tracker.learningservice.model.LearningNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningNodeRepository extends JpaRepository<LearningNode, Long> {
    List<LearningNode> findByRoadmapIdOrderBySequenceOrder(Long roadmapId);
}
