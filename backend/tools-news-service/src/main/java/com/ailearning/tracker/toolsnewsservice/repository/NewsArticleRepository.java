package com.ailearning.tracker.toolsnewsservice.repository;

import com.ailearning.tracker.toolsnewsservice.model.NewsArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long>, JpaSpecificationExecutor<NewsArticle> {
    List<NewsArticle> findByCategoryOrderByPublishedDateDesc(String category);
    Page<NewsArticle> findByCategoryOrderByPublishedDateDesc(String category, Pageable pageable);
    
    List<NewsArticle> findByTitleContainingIgnoreCaseOrSummaryContainingIgnoreCase(
            String title, String summary);
    
    List<NewsArticle> findAllByOrderByPublishedDateDesc();

    Optional<NewsArticle> findFirstByDuplicateHash(String duplicateHash);
}
