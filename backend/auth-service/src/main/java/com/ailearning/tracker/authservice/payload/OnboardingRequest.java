package com.ailearning.tracker.authservice.payload;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OnboardingRequest {
    private String skillLevel;
    private String background;
    private String learningGoal;
    private Double hoursPerDay;
    private String learningStyle;
}
