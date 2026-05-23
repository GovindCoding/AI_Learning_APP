package com.ailearning.tracker.toolsnewsservice.controller;

import com.ailearning.tracker.toolsnewsservice.model.Bookmark;
import com.ailearning.tracker.toolsnewsservice.model.NewsArticle;
import com.ailearning.tracker.toolsnewsservice.repository.BookmarkRepository;
import com.ailearning.tracker.toolsnewsservice.repository.NewsArticleRepository;
import com.ailearning.tracker.toolsnewsservice.service.NewsSyncScheduler;
import com.ailearning.tracker.toolsnewsservice.service.LocalAISummarizer;
import com.ailearning.tracker.toolsnewsservice.service.NewsSseBroadcaster;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/v1/news")
public class NewsController {

    @Autowired
    private NewsArticleRepository newsArticleRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private NewsSyncScheduler newsSyncScheduler;

    @Autowired
    private NewsSseBroadcaster newsSseBroadcaster;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<?> getNews(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) Boolean trendingOnly,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "publishedDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Specification<NewsArticle> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("All")) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (company != null && !company.isEmpty() && !company.equalsIgnoreCase("All")) {
                predicates.add(cb.equal(root.get("aiCompany"), company));
            }

            if (dateRange != null && !dateRange.isEmpty() && !dateRange.equalsIgnoreCase("All")) {
                LocalDateTime cutoff = null;
                if (dateRange.equalsIgnoreCase("TODAY")) {
                    cutoff = LocalDateTime.now().minusDays(1);
                } else if (dateRange.equalsIgnoreCase("WEEK")) {
                    cutoff = LocalDateTime.now().minusWeeks(1);
                } else if (dateRange.equalsIgnoreCase("MONTH")) {
                    cutoff = LocalDateTime.now().minusMonths(1);
                } else if (dateRange.equalsIgnoreCase("TWO_MONTHS")) {
                    cutoff = LocalDateTime.now().minusMonths(2);
                }
                if (cutoff != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("publishedDate"), cutoff));
                }
            }

            if (trendingOnly != null && trendingOnly) {
                predicates.add(cb.greaterThan(root.get("trendingScore"), 7.0));
            }

            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate summaryLike = cb.like(cb.lower(root.get("summary")), searchPattern);
                Predicate tagsLike = cb.like(cb.lower(root.get("tags")), searchPattern);
                predicates.add(cb.or(titleLike, summaryLike, tagsLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<NewsArticle> articlePage = newsArticleRepository.findAll(spec, pageable);
        return ResponseEntity.ok(articlePage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsArticle> getNewsById(@PathVariable Long id) {
        return newsArticleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getAiSummary(@PathVariable Long id) {
        return newsArticleRepository.findById(id)
                .map(article -> {
                    String insightsRaw = article.getAiInsights();
                    Map<String, String> insightsMap = new HashMap<>();

                    if (insightsRaw == null || insightsRaw.isEmpty()) {
                        String generated = LocalAISummarizer.generateInsights(article.getTitle(), article.getSummary(), article.getCategory());
                        try {
                            insightsMap = objectMapper.readValue(generated, Map.class);
                        } catch (Exception e) {
                            insightsMap.put("takeaways", article.getAiSummary() != null ? article.getAiSummary() : article.getSummary());
                        }
                    } else {
                        try {
                            insightsMap = objectMapper.readValue(insightsRaw, Map.class);
                        } catch (Exception e) {
                            insightsMap.put("takeaways", insightsRaw);
                        }
                    }

                    // Ensure fallback to traditional aiSummary field if the map is sparse
                    if (!insightsMap.containsKey("takeaways") || insightsMap.get("takeaways").isEmpty()) {
                        insightsMap.put("takeaways", article.getAiSummary() != null ? article.getAiSummary() : article.getSummary());
                    }

                    return ResponseEntity.ok(insightsMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<?> getSavedNews(@RequestParam Long userId) {
        List<Bookmark> bookmarks = bookmarkRepository.findByUserIdAndItemType(userId, "NEWS");
        List<NewsArticle> savedArticles = new ArrayList<>();
        for (Bookmark b : bookmarks) {
            newsArticleRepository.findById(b.getItemId()).ifPresent(savedArticles::add);
        }
        return ResponseEntity.ok(savedArticles);
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Bookmark> bookmarkOpt = bookmarkRepository.findByUserIdAndItemTypeAndItemId(userId, "NEWS", id);
        if (bookmarkOpt.isPresent()) {
            bookmarkRepository.delete(bookmarkOpt.get());
            return ResponseEntity.ok(Map.of("bookmarked", false, "message", "Article removed from bookmarks"));
        } else {
            Bookmark b = Bookmark.builder()
                    .userId(userId)
                    .itemType("NEWS")
                    .itemId(id)
                    .savedAt(LocalDateTime.now())
                    .build();
            bookmarkRepository.save(b);
            return ResponseEntity.ok(Map.of("bookmarked", true, "message", "Article saved to bookmarks"));
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<?> triggerSync() {
        int newlyIngested = newsSyncScheduler.performSync();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "News synchronization completed successfully",
                "newlyIngestedCount", newlyIngested
        ));
    }

    @GetMapping("/stream")
    public SseEmitter streamNews() {
        return newsSseBroadcaster.registerEmitter();
    }
}
