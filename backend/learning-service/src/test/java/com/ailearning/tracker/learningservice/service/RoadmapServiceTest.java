package com.ailearning.tracker.learningservice.service;

import com.ailearning.tracker.learningservice.model.Roadmap;
import com.ailearning.tracker.learningservice.repository.LearningNodeRepository;
import com.ailearning.tracker.learningservice.repository.RoadmapRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RoadmapServiceTest {

    @Mock
    private RoadmapRepository roadmapRepository;

    @Mock
    private LearningNodeRepository learningNodeRepository;

    @InjectMocks
    private RoadmapService roadmapService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGenerateRoadmap_GenerativeAI() {
        Long userId = 1L;
        String skillLevel = "beginner";
        String background = "software engineer";
        String goal = "Generative AI Engineer";
        Double hoursPerDay = 2.0;
        String learningStyle = "hands-on projects";

        // Mock roadmap save
        when(roadmapRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(roadmapRepository.save(any(Roadmap.class))).thenAnswer(invocation -> {
            Roadmap r = invocation.getArgument(0);
            r.setId(10L); // set mock ID
            return r;
        });

        // Execute service
        Roadmap generated = roadmapService.generateRoadmap(userId, skillLevel, background, goal, hoursPerDay, learningStyle);

        // Asserts
        assertNotNull(generated);
        assertEquals(10L, generated.getId());
        assertEquals("Generative AI Engineer", generated.getGoal());
        assertEquals("beginner", generated.getSkillLevel());
        assertEquals(2.0, generated.getTargetHoursPerDay());

        // Verify repository interactions
        verify(roadmapRepository, times(1)).findByUserId(userId);
        verify(roadmapRepository, times(1)).save(any(Roadmap.class));
        verify(learningNodeRepository, times(1)).saveAll(anyList());
    }

    @Test
    public void testGenerateRoadmap_MLEngineer() {
        Long userId = 2L;
        String skillLevel = "advanced";
        String background = "data analyst";
        String goal = "ML Engineer";
        Double hoursPerDay = 3.0;
        String learningStyle = "video";

        when(roadmapRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(roadmapRepository.save(any(Roadmap.class))).thenAnswer(invocation -> {
            Roadmap r = invocation.getArgument(0);
            r.setId(20L);
            return r;
        });

        Roadmap generated = roadmapService.generateRoadmap(userId, skillLevel, background, goal, hoursPerDay, learningStyle);

        assertNotNull(generated);
        assertEquals(20L, generated.getId());
        assertEquals("ML Engineer", generated.getGoal());
        // For advanced user, weeks should adapt down
        assertTrue(generated.getEstimatedCompletionWeeks() <= 8);

        verify(roadmapRepository, times(1)).save(any(Roadmap.class));
    }
}
