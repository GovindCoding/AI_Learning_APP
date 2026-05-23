package com.ailearning.tracker.learningservice.controller;

import com.ailearning.tracker.learningservice.model.DailyLog;
import com.ailearning.tracker.learningservice.model.LearningNode;
import com.ailearning.tracker.learningservice.model.Roadmap;
import com.ailearning.tracker.learningservice.repository.DailyLogRepository;
import com.ailearning.tracker.learningservice.repository.LearningNodeRepository;
import com.ailearning.tracker.learningservice.repository.RoadmapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/learning/analytics")
public class AnalyticsController {
    @Autowired
    DailyLogRepository dailyLogRepository;

    @Autowired
    RoadmapRepository roadmapRepository;

    @Autowired
    LearningNodeRepository learningNodeRepository;

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(
            @RequestParam Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) startDate = LocalDate.now().minusYears(1);
        if (endDate == null) endDate = LocalDate.now();

        List<DailyLog> logs = dailyLogRepository.findByUserIdAndLogDateBetween(userId, startDate, endDate);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getAnalyticsSummary(@RequestParam Long userId) {
        // Fetch all daily logs
        List<DailyLog> logs = dailyLogRepository.findByUserIdAndLogDateBetween(userId, LocalDate.now().minusYears(1), LocalDate.now());
        
        double totalHours = logs.stream().mapToDouble(DailyLog::getHoursLearned).sum();
        int completedCount = logs.stream().mapToInt(DailyLog::getNodesCompleted).sum();
        int totalXpGained = logs.stream().mapToInt(DailyLog::getXpGained).sum();

        // Calculate progress percentage on the active roadmap
        Optional<Roadmap> roadmapOpt = roadmapRepository.findByUserId(userId);
        double progressPercentage = 0.0;
        int totalNodes = 0;
        int completedNodes = 0;

        if (roadmapOpt.isPresent()) {
            List<LearningNode> nodes = learningNodeRepository.findByRoadmapIdOrderBySequenceOrder(roadmapOpt.get().getId());
            totalNodes = nodes.size();
            completedNodes = (int) nodes.stream().filter(n -> n.getStatus().equalsIgnoreCase("COMPLETED")).count();
            if (totalNodes > 0) {
                progressPercentage = ((double) completedNodes / totalNodes) * 100;
            }
        }

        // Calculate weekly distribution (past 7 days)
        Map<String, Double> weeklyStudyMap = new HashMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String dayName = date.getDayOfWeek().name().substring(0, 3);
            double hours = dailyLogRepository.findByUserIdAndLogDate(userId, date)
                    .map(DailyLog::getHoursLearned)
                    .orElse(0.0);
            weeklyStudyMap.put(dayName, hours);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalHours", totalHours);
        summary.put("completedNodesCount", completedNodes);
        summary.put("totalNodesCount", totalNodes);
        summary.put("progressPercentage", progressPercentage);
        summary.put("totalXpGained", totalXpGained);
        summary.put("weeklyDistribution", weeklyStudyMap);
        
        // Calculate dynamic AI readiness score (heuristic based on completed nodes, difficulty, and quiz scores)
        double readinessScore = 0.0;
        if (roadmapOpt.isPresent()) {
            List<LearningNode> nodes = learningNodeRepository.findByRoadmapIdOrderBySequenceOrder(roadmapOpt.get().getId());
            double scoreSum = 0;
            int scoredCount = 0;
            for (LearningNode n : nodes) {
                if (n.getStatus().equalsIgnoreCase("COMPLETED")) {
                    int weight = n.getDifficulty().equalsIgnoreCase("advanced") ? 3 :
                                 n.getDifficulty().equalsIgnoreCase("intermediate") ? 2 : 1;
                    int quizVal = n.getQuizScore() != null ? n.getQuizScore() : 80; // default 80 if completed directly
                    scoreSum += quizVal * weight;
                    scoredCount += weight;
                }
            }
            if (scoredCount > 0) {
                readinessScore = scoreSum / scoredCount;
            }
        }
        summary.put("aiReadinessScore", readinessScore);

        return ResponseEntity.ok(summary);
    }
}
