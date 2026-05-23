package com.ailearning.tracker.toolsnewsservice.controller;

import com.ailearning.tracker.toolsnewsservice.model.Tool;
import com.ailearning.tracker.toolsnewsservice.repository.BookmarkRepository;
import com.ailearning.tracker.toolsnewsservice.repository.ToolRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

public class ToolControllerTest {

    @Mock
    private ToolRepository toolRepository;

    @Mock
    private BookmarkRepository bookmarkRepository;

    @InjectMocks
    private ToolController toolController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetAllTools_NoFilter() {
        Tool tool1 = Tool.builder().id(1L).name("GPT-4").category("LLMs").build();
        Tool tool2 = Tool.builder().id(2L).name("Claude").category("LLMs").build();
        
        when(toolRepository.findAll()).thenReturn(Arrays.asList(tool1, tool2));

        ResponseEntity<?> response = toolController.getAllTools(null, null, null);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        
        List<Tool> body = (List<Tool>) response.getBody();
        assertEquals(2, body.size());
        assertEquals("GPT-4", body.get(0).getName());
        verify(toolRepository, times(1)).findAll();
    }

    @Test
    public void testGetAllTools_CategoryFilter() {
        Tool tool1 = Tool.builder().id(1L).name("Pinecone").category("Vector Databases").build();
        when(toolRepository.findByCategory("Vector Databases")).thenReturn(Arrays.asList(tool1));

        ResponseEntity<?> response = toolController.getAllTools("Vector Databases", null, null);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());

        List<Tool> body = (List<Tool>) response.getBody();
        assertEquals(1, body.size());
        assertEquals("Pinecone", body.get(0).getName());
        verify(toolRepository, times(1)).findByCategory("Vector Databases");
    }

    @Test
    public void testGetToolById_Found() {
        Tool tool = Tool.builder().id(5L).name("Midjourney").category("AI Image Generation").build();
        when(toolRepository.findById(5L)).thenReturn(Optional.of(tool));

        ResponseEntity<Tool> response = toolController.getToolById(5L);
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Midjourney", response.getBody().getName());
    }

    @Test
    public void testGetToolById_NotFound() {
        when(toolRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<Tool> response = toolController.getToolById(99L);
        assertNotNull(response);
        assertEquals(404, response.getStatusCode().value());
    }
}
