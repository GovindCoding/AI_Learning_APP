package com.ailearning.tracker.learningservice.controller;

import com.ailearning.tracker.learningservice.model.*;
import com.ailearning.tracker.learningservice.repository.DailyLogRepository;
import com.ailearning.tracker.learningservice.repository.LearningNodeRepository;
import com.ailearning.tracker.learningservice.repository.QuizRepository;
import com.ailearning.tracker.learningservice.repository.RoadmapRepository;
import com.ailearning.tracker.learningservice.service.RoadmapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/learning")
public class RoadmapController {
    @Autowired
    RoadmapService roadmapService;

    @Autowired
    RoadmapRepository roadmapRepository;

    @Autowired
    LearningNodeRepository learningNodeRepository;

    @Autowired
    QuizRepository quizRepository;

    @Autowired
    DailyLogRepository dailyLogRepository;

    @PostMapping("/roadmap/generate")
    public ResponseEntity<?> generateRoadmap(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String skillLevel = payload.get("skillLevel").toString();
        String background = payload.get("background").toString();
        String goal = payload.get("goal").toString();
        Double hoursPerDay = Double.valueOf(payload.get("hoursPerDay").toString());
        String learningStyle = payload.get("learningStyle").toString();

        Roadmap roadmap = roadmapService.generateRoadmap(userId, skillLevel, background, goal, hoursPerDay, learningStyle);
        return ResponseEntity.ok(roadmap);
    }

    @GetMapping("/roadmap")
    public ResponseEntity<?> getRoadmap(@RequestParam Long userId) {
        Optional<Roadmap> roadmapOpt = roadmapRepository.findByUserId(userId);
        if (roadmapOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Roadmap roadmap = roadmapOpt.get();
        List<LearningNode> nodes = learningNodeRepository.findByRoadmapIdOrderBySequenceOrder(roadmap.getId());
        return ResponseEntity.ok(Map.of(
            "roadmap", roadmap,
            "nodes", nodes
        ));
    }

    @PutMapping("/node/{nodeId}/status")
    public ResponseEntity<?> updateNodeStatus(@PathVariable Long nodeId, @RequestBody Map<String, String> payload, @RequestParam Long userId) {
        String status = payload.get("status"); // NOT_STARTED, IN_PROGRESS, COMPLETED
        Optional<LearningNode> nodeOpt = learningNodeRepository.findById(nodeId);
        if (nodeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        LearningNode node = nodeOpt.get();
        String oldStatus = node.getStatus();
        node.setStatus(status);

        if (status.equalsIgnoreCase("COMPLETED") && !oldStatus.equalsIgnoreCase("COMPLETED")) {
            node.setCompletedAt(LocalDateTime.now());
            
            // Log learning metrics for user heatmap
            LocalDate today = LocalDate.now();
            Optional<DailyLog> logOpt = dailyLogRepository.findByUserIdAndLogDate(userId, today);
            DailyLog log;
            if (logOpt.isPresent()) {
                log = logOpt.get();
                log.setHoursLearned(log.getHoursLearned() + node.getDurationHours());
                log.setNodesCompleted(log.getNodesCompleted() + 1);
                log.setXpGained(log.getXpGained() + 200); // 200 XP for node completion
            } else {
                log = DailyLog.builder()
                        .userId(userId)
                        .logDate(today)
                        .hoursLearned(node.getDurationHours())
                        .nodesCompleted(1)
                        .xpGained(200)
                        .notes("Completed: " + node.getTitle())
                        .build();
            }
            dailyLogRepository.save(log);
        }
        
        learningNodeRepository.save(node);
        return ResponseEntity.ok(Map.of(
            "node", node,
            "message", "Node status updated successfully!"
        ));
    }

    @GetMapping("/node/{nodeId}/quiz")
    public ResponseEntity<?> getNodeQuiz(@PathVariable Long nodeId) {
        List<Quiz> quizzes = quizRepository.findByNodeId(nodeId);
        return ResponseEntity.ok(quizzes);
    }

    @PostMapping("/node/{nodeId}/quiz/submit")
    public ResponseEntity<?> submitQuizAnswers(@PathVariable Long nodeId, @RequestBody Map<String, Map<Long, String>> payload, @RequestParam Long userId) {
        // payload format: {"answers": {quizId: "A", quizId2: "C"}}
        Map<Long, String> answers = payload.get("answers");
        List<Quiz> quizzes = quizRepository.findByNodeId(nodeId);
        if (quizzes.isEmpty()) {
            return ResponseEntity.badRequest().body("No quiz found for this node.");
        }

        int correctCount = 0;
        for (Quiz q : quizzes) {
            String submittedAns = answers.get(q.getId().toString()); // Map keys get serialized as strings in JSON keys
            if (submittedAns == null) {
                // Try fetching by Long if map parsed keys directly
                submittedAns = answers.get(q.getId());
            }
            if (submittedAns != null && submittedAns.equalsIgnoreCase(q.getCorrectOption())) {
                correctCount++;
            }
        }

        int scorePercentage = (int) (((double) correctCount / quizzes.size()) * 100);
        boolean passed = scorePercentage >= 70;

        Optional<LearningNode> nodeOpt = learningNodeRepository.findById(nodeId);
        if (nodeOpt.isPresent()) {
            LearningNode node = nodeOpt.get();
            node.setQuizScore(scorePercentage);
            if (passed && !node.getStatus().equalsIgnoreCase("COMPLETED")) {
                node.setStatus("COMPLETED");
                node.setCompletedAt(LocalDateTime.now());
                
                // Add DailyLog entry
                LocalDate today = LocalDate.now();
                Optional<DailyLog> logOpt = dailyLogRepository.findByUserIdAndLogDate(userId, today);
                DailyLog log;
                if (logOpt.isPresent()) {
                    log = logOpt.get();
                    log.setNodesCompleted(log.getNodesCompleted() + 1);
                    log.setXpGained(log.getXpGained() + 300); // 300 XP for passing quiz + completing node
                } else {
                    log = DailyLog.builder()
                            .userId(userId)
                            .logDate(today)
                            .hoursLearned(node.getDurationHours())
                            .nodesCompleted(1)
                            .xpGained(300)
                            .notes("Passed Quiz & Completed: " + node.getTitle())
                            .build();
                }
                dailyLogRepository.save(log);
            }
            learningNodeRepository.save(node);
        }

        return ResponseEntity.ok(Map.of(
            "score", scorePercentage,
            "correctCount", correctCount,
            "totalCount", quizzes.size(),
            "passed", passed,
            "xpGained", passed ? 300 : 0
        ));
    }

    @PostMapping("/roadmap/custom-node")
    public ResponseEntity<?> addCustomNode(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String title = payload.get("title").toString();
        String description = payload.get("description").toString();
        String difficulty = payload.get("difficulty").toString();
        Double durationHours = Double.valueOf(payload.get("durationHours").toString());

        Optional<Roadmap> roadmapOpt = roadmapRepository.findByUserId(userId);
        if (roadmapOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No active roadmap found for user. Please generate one first.");
        }
        Roadmap roadmap = roadmapOpt.get();
        List<LearningNode> existingNodes = learningNodeRepository.findByRoadmapIdOrderBySequenceOrder(roadmap.getId());
        int nextOrder = 1;
        if (!existingNodes.isEmpty()) {
            nextOrder = existingNodes.get(existingNodes.size() - 1).getSequenceOrder() + 1;
        }

        LearningNode customNode = LearningNode.builder()
                .roadmap(roadmap)
                .title(title)
                .description(description)
                .difficulty(difficulty)
                .durationHours(durationHours)
                .status("NOT_STARTED")
                .sequenceOrder(nextOrder)
                .build();

        learningNodeRepository.save(customNode);

        List<LearningNode> updatedNodes = learningNodeRepository.findByRoadmapIdOrderBySequenceOrder(roadmap.getId());
        return ResponseEntity.ok(Map.of(
            "nodes", updatedNodes,
            "message", "Custom node added to roadmap successfully!"
        ));
    }
}
