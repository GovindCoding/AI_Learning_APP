package com.ailearning.tracker.toolsnewsservice.controller;

import com.ailearning.tracker.toolsnewsservice.model.*;
import com.ailearning.tracker.toolsnewsservice.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class SocialControllerTest {

    @Mock
    private SocialSettingsRepository socialSettingsRepository;

    @Mock
    private SocialDraftRepository socialDraftRepository;

    @Mock
    private SocialAnalyticsRepository socialAnalyticsRepository;

    @Mock
    private NewsArticleRepository newsArticleRepository;

    @Mock
    private ToolRepository toolRepository;

    @InjectMocks
    private SocialController socialController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetSettings_New() {
        Long userId = 1L;
        when(socialSettingsRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(socialSettingsRepository.save(any(SocialSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<SocialSettings> response = socialController.getSettings(userId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        SocialSettings settings = response.getBody();
        assertNotNull(settings);
        assertEquals(userId, settings.getUserId());
        assertEquals("#0284c7,#6366f1", settings.getBrandColors());
        verify(socialSettingsRepository, times(1)).save(any(SocialSettings.class));
    }

    @Test
    public void testGetSettings_Existing() {
        Long userId = 1L;
        SocialSettings existing = SocialSettings.builder()
                .id(10L)
                .userId(userId)
                .brandColors("#ff0000,#00ff00")
                .writingTone("Founder")
                .build();
        when(socialSettingsRepository.findByUserId(userId)).thenReturn(Optional.of(existing));

        ResponseEntity<SocialSettings> response = socialController.getSettings(userId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        SocialSettings settings = response.getBody();
        assertNotNull(settings);
        assertEquals(10L, settings.getId());
        assertEquals("Founder", settings.getWritingTone());
        verify(socialSettingsRepository, never()).save(any(SocialSettings.class));
    }

    @Test
    public void testSaveSettings_Existing() {
        SocialSettings request = SocialSettings.builder()
                .userId(1L)
                .brandColors("#000,#fff")
                .writingTone("Technical")
                .build();
        SocialSettings existing = SocialSettings.builder()
                .id(10L)
                .userId(1L)
                .brandColors("#111,#222")
                .writingTone("Professional")
                .build();

        when(socialSettingsRepository.findByUserId(1L)).thenReturn(Optional.of(existing));
        when(socialSettingsRepository.save(any(SocialSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<SocialSettings> response = socialController.saveSettings(request);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        SocialSettings saved = response.getBody();
        assertNotNull(saved);
        assertEquals(10L, saved.getId());
        assertEquals("#000,#fff", saved.getBrandColors());
        assertEquals("Technical", saved.getWritingTone());
    }

    @Test
    public void testGetDrafts() {
        Long userId = 1L;
        SocialDraft draft1 = SocialDraft.builder().id(101L).userId(userId).title("Draft 1").build();
        SocialDraft draft2 = SocialDraft.builder().id(102L).userId(userId).title("Draft 2").build();
        when(socialDraftRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(Arrays.asList(draft1, draft2));

        ResponseEntity<List<SocialDraft>> response = socialController.getDrafts(userId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        List<SocialDraft> body = response.getBody();
        assertNotNull(body);
        assertEquals(2, body.size());
        assertEquals("Draft 1", body.get(0).getTitle());
    }

    @Test
    public void testSaveDraft() {
        SocialDraft draft = SocialDraft.builder()
                .userId(1L)
                .title("New post draft")
                .content("Draft content")
                .platforms("LinkedIn")
                .status("DRAFT")
                .build();

        when(socialDraftRepository.save(any(SocialDraft.class))).thenAnswer(invocation -> {
            SocialDraft saved = invocation.getArgument(0);
            saved.setId(999L);
            return saved;
        });
        when(socialAnalyticsRepository.save(any(SocialAnalytics.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<SocialDraft> response = socialController.saveDraft(draft);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        SocialDraft savedDraft = response.getBody();
        assertNotNull(savedDraft);
        assertEquals(999L, savedDraft.getId());
        verify(socialDraftRepository, times(1)).save(draft);
        verify(socialAnalyticsRepository, times(1)).save(any(SocialAnalytics.class));
    }

    @Test
    public void testDeleteDraft_Found() {
        Long id = 101L;
        SocialDraft existing = SocialDraft.builder().id(id).build();
        when(socialDraftRepository.findById(id)).thenReturn(Optional.of(existing));

        ResponseEntity<?> response = socialController.deleteDraft(id);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        verify(socialDraftRepository, times(1)).delete(existing);
    }

    @Test
    public void testDeleteDraft_NotFound() {
        Long id = 101L;
        when(socialDraftRepository.findById(id)).thenReturn(Optional.empty());

        ResponseEntity<?> response = socialController.deleteDraft(id);
        assertNotNull(response);
        assertEquals(404, response.getStatusCode().value());
        verify(socialDraftRepository, never()).delete(any());
    }

    @Test
    public void testGetAnalyticsSummary() {
        Long userId = 1L;
        when(socialAnalyticsRepository.countByUserIdAndActionType(userId, "GENERATED")).thenReturn(10L);
        when(socialAnalyticsRepository.countByUserIdAndActionType(userId, "SHARED")).thenReturn(5L);
        when(socialAnalyticsRepository.countByUserIdAndActionType(userId, "SCHEDULED")).thenReturn(2L);
        when(socialAnalyticsRepository.countByUserIdAndActionType(userId, "DOWNLOADED")).thenReturn(4L);

        ResponseEntity<?> response = socialController.getAnalyticsSummary(userId);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> summary = (Map<String, Object>) response.getBody();
        assertNotNull(summary);
        assertEquals(10L, summary.get("totalGenerated"));
        assertEquals(5L, summary.get("totalShared"));
        assertEquals(2L, summary.get("totalScheduled"));
        assertEquals(4L, summary.get("totalDownloaded"));
        assertTrue(summary.containsKey("weeklyPosts"));
        assertTrue(summary.containsKey("popularHashtags"));
    }

    @Test
    public void testGeneratePost_News() {
        Long newsId = 5L;
        NewsArticle article = NewsArticle.builder()
                .id(newsId)
                .title("New GPT model released")
                .summary("OpenAI released a brand new GPT model that runs local code natively.")
                .category("AI Models")
                .build();

        when(newsArticleRepository.findById(newsId)).thenReturn(Optional.of(article));

        Map<String, Object> request = new HashMap<>();
        request.put("type", "NEWS");
        request.put("tone", "Creator");
        request.put("id", newsId);

        ResponseEntity<?> response = socialController.generatePost(request);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertNotNull(responseBody);
        assertTrue(responseBody.containsKey("fullContent"));
        assertTrue(responseBody.get("fullContent").contains("GPT model"));
        assertTrue(responseBody.get("fullContent").contains("#LinkedInCreator"));
    }
}
