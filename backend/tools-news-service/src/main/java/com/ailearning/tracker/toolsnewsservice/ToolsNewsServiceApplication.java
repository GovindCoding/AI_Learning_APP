package com.ailearning.tracker.toolsnewsservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ToolsNewsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ToolsNewsServiceApplication.class, args);
    }
}
