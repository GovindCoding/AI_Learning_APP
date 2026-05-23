package com.ailearning.tracker.toolsnewsservice.repository;

import com.ailearning.tracker.toolsnewsservice.model.Tool;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ToolRepository extends JpaRepository<Tool, Long> {
    List<Tool> findByCategory(String category);
    Page<Tool> findByCategory(String category, Pageable pageable);
    
    List<Tool> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrTagsContainingIgnoreCase(
            String name, String description, String tags);
    
    List<Tool> findByPricingIgnoreCase(String pricing);
}
