package com.ailearning.tracker.learningservice.repository;

import com.ailearning.tracker.learningservice.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByNodeId(Long nodeId);
}
