package com.ailearning.tracker.learningservice.service;

import com.ailearning.tracker.learningservice.model.LearningNode;
import com.ailearning.tracker.learningservice.model.Roadmap;
import com.ailearning.tracker.learningservice.repository.LearningNodeRepository;
import com.ailearning.tracker.learningservice.repository.RoadmapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RoadmapService {
    @Autowired
    RoadmapRepository roadmapRepository;

    @Autowired
    LearningNodeRepository learningNodeRepository;

    @Transactional
    public Roadmap generateRoadmap(Long userId, String skillLevel, String background,
                                   String goal, Double hoursPerDay, String learningStyle) {
        
        // Remove existing roadmap if any
        roadmapRepository.findByUserId(userId).ifPresent(roadmapRepository::delete);

        int weeks = 12;
        if (hoursPerDay > 2.0) weeks = 8;
        if (skillLevel.equalsIgnoreCase("advanced")) weeks = 6;

        Roadmap roadmap = Roadmap.builder()
                .userId(userId)
                .skillLevel(skillLevel)
                .background(background)
                .goal(goal)
                .targetHoursPerDay(hoursPerDay)
                .learningStyle(learningStyle)
                .estimatedCompletionWeeks(weeks)
                .createdAt(LocalDateTime.now())
                .build();

        roadmap = roadmapRepository.save(roadmap);

        // Generate curriculum nodes based on learning goal
        List<LearningNode> nodes = new ArrayList<>();
        int order = 1;

        // Core Baseline Nodes
        nodes.add(createNode(roadmap, "AI & Machine Learning Fundamentals",
                "Learn core definitions, supervised/unsupervised learning, algorithms, and evaluation metrics.",
                "Beginner", 5.0, order++));

        nodes.add(createNode(roadmap, "Python & Math Foundations for AI",
                "Master NumPy, Pandas, linear algebra, calculus, and basic probability required for model modeling.",
                "Beginner", 8.0, order++));

        // Goal-Specific Modules
        if (goal.equalsIgnoreCase("ML Engineer") || goal.equalsIgnoreCase("AI Researcher")) {
            nodes.add(createNode(roadmap, "Classical Machine Learning Algorithms",
                    "Deep dive into regression, decision trees, random forests, SVMs, and clustering methods using Scikit-Learn.",
                    "Intermediate", 12.0, order++));
            
            nodes.add(createNode(roadmap, "Deep Learning & Neural Networks",
                    "Understand perceptrons, backpropagation, activation functions, and training with PyTorch.",
                    "Intermediate", 15.0, order++));
            
            nodes.add(createNode(roadmap, "Computer Vision or NLP foundations",
                    "Explore CNNs for images or RNNs/LSTMs for sequential text processing.",
                    "Intermediate", 15.0, order++));
            
            nodes.add(createNode(roadmap, "Model Deployment & MLOps",
                    "Learn to track experiments (MLflow), containerize models (Docker), and deploy to AWS/GCP.",
                    "Advanced", 20.0, order++));
            
        } else if (goal.equalsIgnoreCase("Become Expert in Gemini Ecosystem") || goal.toLowerCase().contains("gemini")) {
            nodes.add(createNode(roadmap, "Gemini API & Google AI Studio",
                    "Master Gemini API integration and build rapid prototypes using Google AI Studio.",
                    "Beginner", 6.0, order++));
            
            nodes.add(createNode(roadmap, "Prompt Engineering with Gemini",
                    "Design complex system instructions, structured JSON schemas, and multi-shot prompts using Gemini.",
                    "Beginner", 8.0, order++));

            nodes.add(createNode(roadmap, "Gemini Multimodal AI (Video, Audio, Images)",
                    "Utilize Gemini's native multimodal capabilities to analyze and search video, audio, and documents.",
                    "Intermediate", 10.0, order++));

            nodes.add(createNode(roadmap, "RAG with Gemini & Vertex AI Vector Search",
                    "Integrate Gemini with Vertex AI Vector Search and vector databases for retrieval-augmented generation.",
                    "Intermediate", 12.0, order++));

            nodes.add(createNode(roadmap, "Gemini SDK Integration & Workflows",
                    "Connect Gemini SDK in Python, Java, or JavaScript and set up structured tool calling.",
                    "Intermediate", 10.0, order++));

            nodes.add(createNode(roadmap, "Gemma Open-Source Models",
                    "Download, run, and fine-tune Gemma open-source models locally using vLLM or Ollama.",
                    "Advanced", 14.0, order++));

            nodes.add(createNode(roadmap, "Gemini Agents & Tool Calling",
                    "Orchestrate autonomous agent networks using Gemini and frameworks like LangGraph and CrewAI.",
                    "Advanced", 16.0, order++));

            nodes.add(createNode(roadmap, "Android AI Integration & Vertex AI Deployment",
                    "Embed on-device AI using Gemini Nano on Android, and deploy production endpoints on Google Cloud Vertex AI.",
                    "Advanced", 18.0, order++));
        } else if (goal.equalsIgnoreCase("Generative AI Engineer") || goal.equalsIgnoreCase("AI Product Builder") || goal.equalsIgnoreCase("Prompt Engineer")) {
            nodes.add(createNode(roadmap, "Introduction to LLMs & Prompt Engineering",
                    "Study tokenization, model parameters, zero-shot/few-shot prompting, and chain-of-thought engineering.",
                    "Intermediate", 10.0, order++));
            
            nodes.add(createNode(roadmap, "Vector Databases & Semantic Search",
                    "Learn about embeddings, indexing, and querying vectors in Pinecone, Milvus, and ChromaDB.",
                    "Intermediate", 8.0, order++));

            nodes.add(createNode(roadmap, "LangChain & LlamaIndex Orchestration",
                    "Build conversational memory, document readers, customized search indexes, and composite chains.",
                    "Advanced", 16.0, order++));

            nodes.add(createNode(roadmap, "Retrieval-Augmented Generation (RAG) Systems",
                    "Integrate LLMs with vector stores to create Q&A systems over private knowledge documents.",
                    "Advanced", 18.0, order++));
            
            nodes.add(createNode(roadmap, "Autonomous AI Agents",
                    "Deploy multi-agent teams using CrewAI or LangGraph for autonomous task execution.",
                    "Advanced", 15.0, order++));
            
            nodes.add(createNode(roadmap, "LLMOps: Fine-Tuning & Monitoring",
                    "Learn LoRA, QLoRA fine-tuning paradigms, and prompt evaluations with LangSmith.",
                    "Advanced", 14.0, order++));
        } else {
            // Default Generalist Path
            nodes.add(createNode(roadmap, "Deep Learning & Neural Networks",
                    "Learn forward/backward passes, PyTorch implementations, and basic CNN configurations.",
                    "Intermediate", 12.0, order++));
            
            nodes.add(createNode(roadmap, "Generative AI Foundations",
                    "Introduction to Transformer networks, GPT architectures, and basic prompt engineering.",
                    "Intermediate", 10.0, order++));
            
            nodes.add(createNode(roadmap, "AI API Integrations & Automation",
                    "Connect OpenAI/Gemini APIs to build simple wrapper products and workflows.",
                    "Advanced", 15.0, order++));
        }

        learningNodeRepository.saveAll(nodes);
        roadmap.setNodes(nodes);

        return roadmap;
    }

    private LearningNode createNode(Roadmap roadmap, String title, String description,
                                    String difficulty, double durationHours, int sequenceOrder) {
        return LearningNode.builder()
                .roadmap(roadmap)
                .title(title)
                .description(description)
                .difficulty(difficulty)
                .durationHours(durationHours)
                .status("NOT_STARTED")
                .sequenceOrder(sequenceOrder)
                .build();
    }
}
