package com.ailearning.tracker.authservice.controller;

import com.ailearning.tracker.authservice.model.Badge;
import com.ailearning.tracker.authservice.model.User;
import com.ailearning.tracker.authservice.payload.MessageResponse;
import com.ailearning.tracker.authservice.payload.OnboardingRequest;
import com.ailearning.tracker.authservice.repository.BadgeRepository;
import com.ailearning.tracker.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    BadgeRepository badgeRepository;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: Authenticated user not found in database"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(user);
    }

    @PostMapping("/onboarding")
    public ResponseEntity<?> submitOnboarding(@RequestBody OnboardingRequest request) {
        User user = getAuthenticatedUser();
        user.setSkillLevel(request.getSkillLevel());
        user.setBackground(request.getBackground());
        user.setLearningGoal(request.getLearningGoal());
        user.setHoursPerDay(request.getHoursPerDay());
        user.setLearningStyle(request.getLearningStyle());
        user.setOnboardingDone(true);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Onboarding data saved successfully!"));
    }

    @PostMapping("/xp")
    public ResponseEntity<?> addXp(@RequestBody Map<String, Integer> payload) {
        Integer xpToAdd = payload.getOrDefault("xp", 0);
        User user = getAuthenticatedUser();
        
        int currentXp = user.getXp() + xpToAdd;
        user.setXp(currentXp);
        
        // Dynamic Level Calculation: Level = 1 + floor(xp / 1000)
        int newLevel = 1 + (currentXp / 1000);
        boolean leveledUp = false;
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
            leveledUp = true;
        }

        // Check for newly unlocked badges
        List<Badge> eligibleBadges = badgeRepository.findEarnedBadges(currentXp);
        boolean badgesUnlocked = false;
        for (Badge b : eligibleBadges) {
            if (!user.getBadges().contains(b)) {
                user.getBadges().add(b);
                badgesUnlocked = true;
            }
        }
        
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of(
            "xp", user.getXp(),
            "level", user.getLevel(),
            "leveledUp", leveledUp,
            "badgesUnlocked", badgesUnlocked,
            "message", "XP updated successfully!"
        ));
    }

    @GetMapping("/badges")
    public ResponseEntity<?> getUserBadges() {
        User user = getAuthenticatedUser();
        List<Badge> allBadges = badgeRepository.findAll();
        return ResponseEntity.ok(Map.of(
            "unlocked", user.getBadges(),
            "allBadges", allBadges
        ));
    }
}
