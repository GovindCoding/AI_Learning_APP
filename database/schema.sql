-- MySQL Database Schema for AI Learning Tracker Web Application
-- Username: root | Password: admin1234

-- ==========================================
-- 1. AUTHENTICATION & PROFILE DATABASE (ai_auth_db)
-- ==========================================
CREATE DATABASE IF NOT EXISTS ai_auth_db;
USE ai_auth_db;

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    streak INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    max_streak INT DEFAULT 0,
    onboarding_done BOOLEAN DEFAULT FALSE,
    skill_level VARCHAR(20),
    background VARCHAR(30),
    learning_goal VARCHAR(30),
    hours_per_day DOUBLE DEFAULT 1.0,
    learning_style VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    xp_requirement INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
    user_id BIGINT NOT NULL,
    badge_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- ==========================================
-- 2. LEARNING & ROADMAP DATABASE (ai_learning_db)
-- ==========================================
CREATE DATABASE IF NOT EXISTS ai_learning_db;
USE ai_learning_db;

CREATE TABLE IF NOT EXISTS roadmaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    skill_level VARCHAR(20) NOT NULL,
    background VARCHAR(30) NOT NULL,
    goal VARCHAR(30) NOT NULL,
    target_hours_per_day DOUBLE DEFAULT 1.0,
    learning_style VARCHAR(20) NOT NULL,
    estimated_completion_weeks INT DEFAULT 12,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_nodes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    duration_hours DOUBLE NOT NULL,
    status VARCHAR(20) DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED
    quiz_score INT DEFAULT NULL,
    completed_at TIMESTAMP NULL,
    sequence_order INT NOT NULL,
    parent_node_id BIGINT DEFAULT NULL,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    hours_learned DOUBLE DEFAULT 0.0,
    nodes_completed INT DEFAULT 0,
    xp_gained INT DEFAULT 0,
    notes TEXT,
    UNIQUE KEY unique_user_date (user_id, log_date)
);

CREATE TABLE IF NOT EXISTS quizzes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    node_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option CHAR(1) NOT NULL -- A, B, C, or D
);

-- ==========================================
-- 3. TOOLS & NEWS DATABASE (ai_tools_news_db)
-- ==========================================
CREATE DATABASE IF NOT EXISTS ai_tools_news_db;
USE ai_tools_news_db;

CREATE TABLE IF NOT EXISTS ai_tools (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    website_link VARCHAR(255) NOT NULL,
    chatbot_link VARCHAR(255),
    playground_link VARCHAR(255),
    api_docs_link VARCHAR(255),
    pricing VARCHAR(20) DEFAULT 'FREE', -- FREE, PAID, FREEMIUM, OPEN_SOURCE
    features TEXT, -- JSON-formatted or comma-separated lists
    tags VARCHAR(255),
    popularity_score DOUBLE DEFAULT 0.0,
    community_rating DOUBLE DEFAULT 0.0,
    github_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_articles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    ai_summary TEXT,
    source VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    published_date TIMESTAMP NOT NULL,
    article_link VARCHAR(255) NOT NULL,
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    item_type VARCHAR(10) NOT NULL, -- TOOL or NEWS
    item_id BIGINT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_bookmark (user_id, item_type, item_id)
);
