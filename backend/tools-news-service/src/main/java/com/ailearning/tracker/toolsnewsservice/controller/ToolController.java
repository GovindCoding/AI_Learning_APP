package com.ailearning.tracker.toolsnewsservice.controller;

import com.ailearning.tracker.toolsnewsservice.model.Bookmark;
import com.ailearning.tracker.toolsnewsservice.model.Tool;
import com.ailearning.tracker.toolsnewsservice.repository.BookmarkRepository;
import com.ailearning.tracker.toolsnewsservice.repository.ToolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/tools")
public class ToolController {
    @Autowired
    ToolRepository toolRepository;

    @Autowired
    BookmarkRepository bookmarkRepository;

    @GetMapping
    public ResponseEntity<?> getAllTools(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String pricing) {
        
        List<Tool> tools;
        if (category != null && !category.isEmpty()) {
            tools = toolRepository.findByCategory(category);
        } else if (pricing != null && !pricing.isEmpty()) {
            tools = toolRepository.findByPricingIgnoreCase(pricing);
        } else if (search != null && !search.isEmpty()) {
            tools = toolRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrTagsContainingIgnoreCase(
                    search, search, search);
        } else {
            tools = toolRepository.findAll();
        }
        return ResponseEntity.ok(tools);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tool> getToolById(@PathVariable Long id) {
        return toolRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Tool> createTool(@RequestBody Tool tool) {
        tool.setCreatedAt(LocalDateTime.now());
        Tool saved = toolRepository.save(tool);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites(@RequestParam Long userId) {
        List<Bookmark> bookmarks = bookmarkRepository.findByUserIdAndItemType(userId, "TOOL");
        List<Tool> favTools = new ArrayList<>();
        for (Bookmark b : bookmarks) {
            toolRepository.findById(b.getItemId()).ifPresent(favTools::add);
        }
        return ResponseEntity.ok(favTools);
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<?> toggleFavorite(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Bookmark> bookmarkOpt = bookmarkRepository.findByUserIdAndItemTypeAndItemId(userId, "TOOL", id);
        if (bookmarkOpt.isPresent()) {
            bookmarkRepository.delete(bookmarkOpt.get());
            return ResponseEntity.ok(Map.of("favorited", false, "message", "Tool removed from favorites"));
        } else {
            Bookmark b = Bookmark.builder()
                    .userId(userId)
                    .itemType("TOOL")
                    .itemId(id)
                    .savedAt(LocalDateTime.now())
                    .build();
            bookmarkRepository.save(b);
            return ResponseEntity.ok(Map.of("favorited", true, "message", "Tool added to favorites"));
        }
    }
}
