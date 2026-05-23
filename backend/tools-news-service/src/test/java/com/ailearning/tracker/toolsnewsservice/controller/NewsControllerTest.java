package com.ailearning.tracker.toolsnewsservice.controller;

import com.ailearning.tracker.toolsnewsservice.model.Bookmark;
import com.ailearning.tracker.toolsnewsservice.model.NewsArticle;
import com.ailearning.tracker.toolsnewsservice.repository.BookmarkRepository;
import com.ailearning.tracker.toolsnewsservice.repository.NewsArticleRepository;
import com.ailearning.tracker.toolsnewsservice.service.NewsSseBroadcaster;
import com.ailearning.tracker.toolsnewsservice.service.NewsSyncScheduler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class NewsControllerTest {

    @Mock
    private NewsArticleRepository newsArticleRepository;

    @Mock
    private BookmarkRepository bookmarkRepository;

    @Mock
    private NewsSyncScheduler newsSyncScheduler;

    @Mock
    private NewsSseBroadcaster newsSseBroadcaster;

    @InjectMocks
    private NewsController newsController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetNews_Empty() {
        Page<NewsArticle> emptyPage = new PageImpl<>(Collections.emptyList());
        when(newsArticleRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(emptyPage);

        ResponseEntity<?> response = newsController.getNews(
                "All", "All", "All", false, "", 0, 20, "publishedDate", "desc"
        );

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        Page<NewsArticle> result = (Page<NewsArticle>) response.getBody();
        assertNotNull(result);
        assertTrue(result.getContent().isEmpty());
    }

    @Test
    public void testGetNewsById_Found() {
        Long id = 100L;
        NewsArticle article = NewsArticle.builder()
                .id(id)
                .title("Claude 3.7 Released")
                .summary("Anthropic has unveiled Claude 3.7 Opus.")
                .category("Research")
                .publishedDate(LocalDateTime.now())
                .build();

        when(newsArticleRepository.findById(id)).thenReturn(Optional.of(article));

        ResponseEntity<NewsArticle> response = newsController.getNewsById(id);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Claude 3.7 Released", response.getBody().getTitle());
    }

    @Test
    public void testGetNewsById_NotFound() {
        Long id = 100L;
        when(newsArticleRepository.findById(id)).thenReturn(Optional.empty());

        ResponseEntity<NewsArticle> response = newsController.getNewsById(id);
        assertNotNull(response);
        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    public void testGetAiSummary_DynamicParsing() {
        Long id = 200L;
        NewsArticle article = NewsArticle.builder()
                .id(id)
                .title("Google Launches Gemini 2.0 with Real-Time Video Interaction [999]")
                .summary("Google DeepMind showcased Gemini 2.0, providing native audio and video interaction with zero lag.")
                .category("Google AI updates")
                .aiInsights("") // empty, triggering dynamic LocalAISummarizer mapping
                .build();

        when(newsArticleRepository.findById(id)).thenReturn(Optional.of(article));

        ResponseEntity<?> response = newsController.getAiSummary(id);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());

        Map<String, String> summaryMap = (Map<String, String>) response.getBody();
        assertNotNull(summaryMap);
        assertTrue(summaryMap.containsKey("takeaways"));
        assertTrue(summaryMap.containsKey("beginner"));
        assertTrue(summaryMap.containsKey("business"));
        assertTrue(summaryMap.containsKey("developer"));
        assertTrue(summaryMap.containsKey("learning"));

        // Verify dynamic extraction from title/summary
        assertTrue(summaryMap.get("takeaways").contains("Google Launches Gemini 2.0"));
        assertTrue(summaryMap.get("beginner").contains("Gemini 2.0"));
        assertTrue(summaryMap.get("learning").contains("Gemini 2.0"));
    }

    @Test
    public void testGetSavedNews() {
        Long userId = 1L;
        Bookmark bookmark1 = Bookmark.builder().id(1L).userId(userId).itemId(10L).itemType("NEWS").build();
        Bookmark bookmark2 = Bookmark.builder().id(2L).userId(userId).itemId(11L).itemType("NEWS").build();
        when(bookmarkRepository.findByUserIdAndItemType(userId, "NEWS")).thenReturn(Arrays.asList(bookmark1, bookmark2));

        NewsArticle article1 = NewsArticle.builder().id(10L).title("News 10").build();
        NewsArticle article2 = NewsArticle.builder().id(11L).title("News 11").build();
        when(newsArticleRepository.findById(10L)).thenReturn(Optional.of(article1));
        when(newsArticleRepository.findById(11L)).thenReturn(Optional.of(article2));

        ResponseEntity<?> response = newsController.getSavedNews(userId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        List<NewsArticle> saved = (List<NewsArticle>) response.getBody();
        assertNotNull(saved);
        assertEquals(2, saved.size());
        assertEquals("News 10", saved.get(0).getTitle());
    }

    @Test
    public void testToggleBookmark_Save() {
        Long userId = 1L;
        Long articleId = 10L;
        when(bookmarkRepository.findByUserIdAndItemTypeAndItemId(userId, "NEWS", articleId)).thenReturn(Optional.empty());

        ResponseEntity<?> response = newsController.toggleBookmark(articleId, userId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals(true, body.get("bookmarked"));
        verify(bookmarkRepository, times(1)).save(any(Bookmark.class));
    }

    @Test
    public void testToggleBookmark_Remove() {
        Long userId = 1L;
        Long articleId = 10L;
        Bookmark existing = Bookmark.builder().id(100L).userId(userId).itemId(articleId).itemType("NEWS").build();
        when(bookmarkRepository.findByUserIdAndItemTypeAndItemId(userId, "NEWS", articleId)).thenReturn(Optional.of(existing));

        ResponseEntity<?> response = newsController.toggleBookmark(articleId, userId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals(false, body.get("bookmarked"));
        verify(bookmarkRepository, times(1)).delete(existing);
    }

    @Test
    public void testTriggerSync() {
        when(newsSyncScheduler.performSync()).thenReturn(5);

        ResponseEntity<?> response = newsController.triggerSync();
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals(true, body.get("success"));
        assertEquals(5, body.get("newlyIngestedCount"));
        verify(newsSyncScheduler, times(1)).performSync();
    }

    @Test
    public void testStreamNews() {
        SseEmitter emitter = new SseEmitter();
        when(newsSseBroadcaster.registerEmitter()).thenReturn(emitter);

        SseEmitter result = newsController.streamNews();
        assertNotNull(result);
        assertEquals(emitter, result);
        verify(newsSseBroadcaster, times(1)).registerEmitter();
    }
}
