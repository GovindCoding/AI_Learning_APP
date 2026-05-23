-- SQL delta schema changes for AI Social Studio
-- Target Database: ai_tools_news_db
USE ai_tools_news_db;

-- Brand settings for customizable visual generators
CREATE TABLE IF NOT EXISTS social_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    brand_colors VARCHAR(100) DEFAULT '#0284c7,#6366f1',
    personal_logo TEXT,
    name_signature VARCHAR(100),
    writing_tone VARCHAR(50) DEFAULT 'Professional',
    preferred_hashtags VARCHAR(255) DEFAULT '#AI #Tech',
    image_template VARCHAR(50) DEFAULT 'Modern Gradient',
    watermark_text VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Drafts and scheduled posts
CREATE TABLE IF NOT EXISTS social_drafts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    ai_image_url TEXT,
    platforms VARCHAR(100) DEFAULT 'LINKEDIN',
    tone VARCHAR(50) DEFAULT 'Professional',
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SCHEDULED, PUBLISHED
    scheduled_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Analytics logging
CREATE TABLE IF NOT EXISTS social_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    post_id BIGINT,
    platform VARCHAR(50) DEFAULT 'LINKEDIN',
    action_type VARCHAR(50) NOT NULL, -- GENERATED, SHARED, SCHEDULED, DOWNLOADED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
