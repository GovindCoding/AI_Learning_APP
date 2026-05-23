package com.ailearning.tracker.toolsnewsservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class LocalAISummarizer {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String generateInsights(String title, String summary, String category) {
        if (title == null || title.isEmpty()) {
            title = "New AI Breakthrough";
        }
        if (summary == null || summary.isEmpty()) {
            summary = "A new milestone in artificial intelligence has been announced, detailing improvements in machine learning models and developer frameworks.";
        }
        if (category == null || category.isEmpty()) {
            category = "AI Tech";
        }

        // Clean up title (remove trailing simulated ID suffix like " [123]")
        String cleanTitle = title.replaceAll("\\s*\\[\\d+\\]\\s*$", "").trim();
        String subject = extractSubject(cleanTitle);

        // 1. Takeaways: Synthesize title and summary dynamically
        String takeaways = "The release of \"" + cleanTitle + "\" represents an important milestone in the " + category + " domain. " +
                "Key Takeaway: " + (summary.endsWith(".") ? summary : summary + ".") + " This development demonstrates the rapid evolution and deployment of next-generation artificial intelligence technologies.";

        // 2. Beginner: Simplify jargon in the summary
        String beginner = "In simple terms, \"" + cleanTitle + "\" is about upgrading current AI systems to be more capable. " +
                "Think of it like upgrading an app to be faster and smarter. " +
                "Summary: " + simplifyJargon(summary) + " This allows everyday developers and users to achieve better results with fewer steps.";

        // 3. Business Impact: Tailor based on keywords like cost, open-source, speed
        String business = "";
        String summaryLower = summary.toLowerCase();
        if (summaryLower.contains("cost") || summaryLower.contains("cheap") || summaryLower.contains("free") || 
            summaryLower.contains("open source") || summaryLower.contains("open-source") || summaryLower.contains("open-weight")) {
            business = "Strategic Business Impact:\n• Significant cost optimization: Reduces dependency on expensive proprietary APIs and licensing fees.\n• Operational flexibility: Open-weights or cost-efficient designs allow businesses to run models on internal infrastructure or choose more affordable cloud configurations.\n• Enhanced data privacy: Permits scaling customer-facing tools and data processing pipelines without transferring sensitive client details to third-party hosts.";
        } else {
            business = "Strategic Business Impact:\n• Increased automation capacity: Enables enterprises to automate more complex reasoning tasks and multi-step customer support or research processes.\n• Competitive advantage: Early adoption of " + subject + " can accelerate workflow pipelines and improve product feature sets.\n• Improved efficiency: Reduces worker cycle times for synthesis, reporting, and coding tasks, yielding high ROI on implementation.";
        }

        // 4. Developer Impact: Build developer specific details from category & keywords
        String developer = "";
        if (category.equalsIgnoreCase("AI Research") || summaryLower.contains("paper") || summaryLower.contains("research")) {
            developer = "Technical Developer Impact:\n• Review structural changes: Inspect the mathematical formulations, architecture benchmarks, and training datasets described in this update.\n• Keep an eye on implementation: Watch for official community code releases (GitHub) and evaluate hardware requirements (VRAM/GPUs).\n• Prepare prototypes: Test the model weights or training pipelines under mock datasets to evaluate actual generalization limits.";
        } else {
            developer = "Technical Developer Impact:\n• API integration updates: Read the updated documentation for " + subject + " to understand system prompts, parameters (e.g., temperature, top_p), and payload schemas.\n• Optimization check: Test memory footprint, token throughput, and potential latency increases on your standard hosting environments.\n• Prompt engineering: Adjust your system prompts to support structured outputs like JSON schemas and handle new multi-step reasoning patterns.";
        }

        // 5. Learning Recommendations
        String learning = "Recommended Study Actions:\n1. Read original source: Review the announcement link, documentation, or technical paper for \"" + cleanTitle + "\".\n2. Hands-on coding: Create a simple script (Python/TypeScript) connecting to the " + subject + " API or downloading the model locally using Ollama/vLLM.\n3. Prototype: Design a basic chatbot or reasoning assistant using a framework like LangChain or CrewAI to test multi-agent workflows.";

        try {
            Map<String, String> insightsMap = new HashMap<>();
            insightsMap.put("takeaways", takeaways);
            insightsMap.put("beginner", beginner);
            insightsMap.put("business", business);
            insightsMap.put("developer", developer);
            insightsMap.put("learning", learning);
            return objectMapper.writeValueAsString(insightsMap);
        } catch (Exception e) {
            return "{\"takeaways\":\"" + takeaways + "\"}";
        }
    }

    private static String extractSubject(String title) {
        if (title == null || title.isEmpty()) {
            return "this technology";
        }

        // Remove typical headline prefixes/suffixes
        String cleanTitle = title.replaceAll("\\s*\\[\\d+\\]\\s*$", "").trim();

        // Split by colon or dash
        if (cleanTitle.contains(":")) {
            return cleanTitle.split(":")[0].trim();
        }
        if (cleanTitle.contains(" - ")) {
            return cleanTitle.split(" - ")[0].trim();
        }

        // Split on common release action verbs
        String[] splitters = {" launches ", " releases ", " introduces ", " announces ", " unveils ", " presents ", " showcases ", " open sources "};
        for (String splitter : splitters) {
            int idx = cleanTitle.toLowerCase().indexOf(splitter);
            if (idx != -1) {
                return cleanTitle.substring(0, idx).trim();
            }
        }

        // Fallback: use first 4 words
        String[] words = cleanTitle.split("\\s+");
        if (words.length > 4) {
            return String.join(" ", Arrays.copyOfRange(words, 0, 4)).trim();
        }

        return cleanTitle;
    }

    private static String simplifyJargon(String text) {
        if (text == null) return "";
        String simplified = text;
        simplified = simplified.replaceAll("(?i)multimodal", "able to process both text and images/audio");
        simplified = simplified.replaceAll("(?i)quantization", "compressing the model to run on regular hardware");
        simplified = simplified.replaceAll("(?i)context window", "memory capacity for text length");
        simplified = simplified.replaceAll("(?i)latency", "delay or waiting time");
        simplified = simplified.replaceAll("(?i)fine-tuning", "specialized practice training");
        simplified = simplified.replaceAll("(?i)retrieval-augmented generation", "letting the AI read reference documents before replying");
        simplified = simplified.replaceAll("(?i)RAG", "matching document references to queries");
        simplified = simplified.replaceAll("(?i)matrix multiplication", "computational math");
        simplified = simplified.replaceAll("(?i)quantized", "compressed");
        simplified = simplified.replaceAll("(?i)benchmarks", "standardized testing scores");
        simplified = simplified.replaceAll("(?i)agentic", "autonomous and goal-driven");
        simplified = simplified.replaceAll("(?i)autonomous agents", "self-running AI tasks");
        return simplified;
    }
}
