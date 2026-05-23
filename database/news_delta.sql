-- SQL delta schema changes for AI News Feed Upgrade
-- Target Database: ai_tools_news_db
USE ai_tools_news_db;

-- 1. Extend the news_articles table
ALTER TABLE news_articles 
ADD COLUMN full_summary TEXT,
ADD COLUMN author VARCHAR(255) DEFAULT 'AI Editor',
ADD COLUMN fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN ai_company VARCHAR(100) DEFAULT 'Generic',
ADD COLUMN related_tools VARCHAR(255),
ADD COLUMN sentiment VARCHAR(50) DEFAULT 'NEUTRAL',
ADD COLUMN popularity_score DOUBLE DEFAULT 0.0,
ADD COLUMN trending_score DOUBLE DEFAULT 0.0,
ADD COLUMN thumbnail_image VARCHAR(555),
ADD COLUMN article_image VARCHAR(555),
ADD COLUMN language VARCHAR(50) DEFAULT 'en',
ADD COLUMN region VARCHAR(50) DEFAULT 'US',
ADD COLUMN ai_insights TEXT,
ADD COLUMN duplicate_hash VARCHAR(255),
ADD COLUMN alternative_references TEXT;

-- 2. Build indices to handle millions of news items efficiently
CREATE INDEX idx_published_date ON news_articles (published_date DESC);
CREATE INDEX idx_category ON news_articles (category);
CREATE INDEX idx_ai_company ON news_articles (ai_company);
CREATE INDEX idx_trending ON news_articles (trending_score DESC);
CREATE INDEX idx_dup_hash ON news_articles (duplicate_hash);

-- 3. Populate relative news articles for the last 60 days
INSERT INTO news_articles 
(title, summary, ai_summary, source, category, published_date, article_link, tags, author, ai_company, related_tools, sentiment, popularity_score, trending_score, thumbnail_image, article_image, ai_insights, duplicate_hash, alternative_references)
VALUES
('OpenAI Launches GPT-4o Mini for Cost-Efficient Intelligence', 
 'OpenAI has announced GPT-4o Mini, a new small model that is 60% cheaper than GPT-3.5 Turbo and outperforms it on key benchmarks.', 
 'OpenAI introduced GPT-4o Mini, setting a new bar for cheap, high-speed multimodal models. It costs 15 cents per million input tokens and 60 cents per million output tokens.', 
 'OpenAI Blog', 
 'OpenAI updates', 
 DATE_SUB(NOW(), INTERVAL 2 DAY), 
 'https://openai.com/index/gpt-4o-mini/', 
 'openai,gpt4o,mini,release', 
 'AI Editor', 
 'OpenAI', 
 'OpenAI GPT-4o', 
 'POSITIVE', 
 9.2, 
 9.5, 
 'https://images.unsplash.com/photo-1677442136019-21780efad99a', 
 'https://images.unsplash.com/photo-1677442136019-21780efad99a', 
 '{"takeaways": "GPT-4o Mini makes high-performance multimodal AI highly affordable for startups.", "beginner": "OpenAI released a smaller, super-fast and cheap version of ChatGPT that developers can build into apps.", "business": "Drastically reduces LLM API expenses, enabling wider AI adoption.", "developer": "Use gpt-4o-mini as a drop-in replacement for gpt-3.5-turbo.", "learning": "Build a simple RAG chatbot utilizing the gpt-4o-mini API."}', 
 'hash_gpt4omini', 
 '["https://techcrunch.com/gpt-4o-mini", "https://news.ycombinator.com/item?id=gpt4o-mini"]'),

('Claude 3.5 Sonnet Setting New Coding Records', 
 'Anthropic has unveiled Claude 3.5 Sonnet, raising the bar for intelligence, speed, and cost-efficiency. It outperforms competitors in coding tasks, math problems, and visual recognition.', 
 'Anthropic launched Claude 3.5 Sonnet, showing major leaps in coding and reasoning tests. It runs at twice the speed of Claude 3 Opus. It is available for free on Claude.ai.', 
 'Anthropic Blog', 
 'Anthropic updates', 
 DATE_SUB(NOW(), INTERVAL 5 DAY), 
 'https://www.anthropic.com/news/claude-3-5-sonnet', 
 'claude,anthropic,llm,release', 
 'Lead Editor', 
 'Anthropic', 
 'Claude 3.5 Sonnet', 
 'POSITIVE', 
 9.7, 
 9.8, 
 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485', 
 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485', 
 '{"takeaways": "Claude 3.5 Sonnet outperforms previous models in code execution and comprehension.", "beginner": "Anthropic updated its AI chatbot Claude, making it much better at writing code and answering logic puzzles.", "business": "Speeds up software development lifecycles and provides higher accuracy automation.", "developer": "Integrate code-generation APIs with Anthropic SDK.", "learning": "Experiment with Claude Artifacts to test UI elements."}', 
 'hash_claude35sonnet', 
 '["https://news.ycombinator.com/item?id=claude-3-5-sonnet", "https://techcrunch.com/anthropic-claude-3-5"]'),

('Google DeepMind Introduces AlphaFold 3 with Biomolecular Interaction Support', 
 'Google DeepMind announced AlphaFold 3, which can predict the structure and interactions of DNA, RNA, proteins, and chemical compounds, opening new frontiers in drug discovery.', 
 'AlphaFold 3 goes beyond proteins to model DNA, RNA, and chemical ligands. This enables deep insight into biological processes and speeds up pharmaceutical research.', 
 'Google DeepMind', 
 'Google AI updates', 
 DATE_SUB(NOW(), INTERVAL 12 DAY), 
 'https://deepmind.google/discover/blog/introducing-alphafold-3/', 
 'alphafold,deepmind,biology,research', 
 'Science Correspondent', 
 'Google DeepMind', 
 'AlphaFold 3', 
 'POSITIVE', 
 9.5, 
 9.0, 
 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e', 
 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e', 
 '{"takeaways": "AlphaFold 3 models full bio-molecular structures including DNA/RNA interactions.", "beginner": "Google DeepMind made an AI that predicts how molecules inside the human body stick together, helping scientists make drugs faster.", "business": "Reduces time-to-market and clinical failure rates in biotechnology.", "developer": "Access the AlphaFold 3 Server for computing structural configurations.", "learning": "Explore the structural output files in bioinformatics tools."}', 
 'hash_alphafold3', 
 '["https://nature.com/articles/alphafold-3", "https://science.org/alphafold-3-review"]'),

('Meta Releases Llama 3 Open-Source Large Language Models', 
 'Meta has released open-source Llama 3 models in 8B and 70B parameter sizes, setting new benchmarks for open-weights models across diverse benchmarks.', 
 'Meta launched Llama 3, their latest open-weights LLM. It shows superior performance in reasoning, coding, and instruction-following, closing the gap with closed models.', 
 'Meta AI Blog', 
 'Meta AI updates', 
 DATE_SUB(NOW(), INTERVAL 18 DAY), 
 'https://ai.meta.com/blog/meta-llama-3/', 
 'llama3,meta,opensource,release', 
 'AI Editor', 
 'Meta AI', 
 'Llama 3', 
 'POSITIVE', 
 9.4, 
 9.2, 
 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', 
 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', 
 '{"takeaways": "Llama 3 sets a high standard for open-source AI performance and safety alignment.", "beginner": "Meta released a new powerful AI model that anyone can download and run on their own computer for free.", "business": "Reduces dependency on commercial APIs and enables local proprietary data privacy.", "developer": "Deploy Llama 3 locally using vLLM or Ollama.", "learning": "Follow the guide to run Llama-3-8B-Instruct on local hardware."}', 
 'hash_llama3', 
 '["https://github.com/meta-llama/llama3", "https://hacker-news.com/llama3-release"]'),

('Microsoft Unveils Phi-3: A Very Capable Open-Source Small Language Model', 
 'Microsoft has announced Phi-3-mini, a 3.8B parameter model that performs better than models twice its size. It is designed to run efficiently on mobile and edge devices.', 
 'Microsoft released Phi-3-mini, a highly-optimized Small Language Model. It achieves impressive benchmarks despite having only 3.8 billion parameters, suitable for local hardware.', 
 'Microsoft Research', 
 'Microsoft AI updates', 
 DATE_SUB(NOW(), INTERVAL 25 DAY), 
 'https://azure.microsoft.com/en-us/blog/introducing-phi-3-redefining-whats-possible-with-slms/', 
 'phi3,microsoft,slm,edge', 
 'Research Lead', 
 'Microsoft AI', 
 'Phi-3', 
 'POSITIVE', 
 8.8, 
 8.5, 
 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', 
 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', 
 '{"takeaways": "Phi-3 demonstrates the viability of high-performance Small Language Models on local hardware.", "beginner": "Microsoft built an AI that is small enough to fit on a phone but still as smart as much larger models.", "business": "Enables cost-effective edge-computing and offline AI capabilities.", "developer": "Convert Phi-3 to ONNX format to run on web browsers or mobile CPUs.", "learning": "Learn to run Phi-3 using WebGPU in Chrome."}', 
 'hash_phi3', 
 '["https://news.microsoft.com/phi-3", "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct"]'),

('Hugging Face Launches Leeloo: A Framework for Multi-Modal Model Alignment', 
 'Hugging Face has open-sourced Leeloo, a framework designed to align multi-modal models using custom human-preference data loops.', 
 'Hugging Face released Leeloo, a multi-modal RLHF framework. It facilitates the process of tuning visual-language models using RLHF or DPO datasets.', 
 'Hugging Face', 
 'AI GitHub trending', 
 DATE_SUB(NOW(), INTERVAL 32 DAY), 
 'https://huggingface.co/blog', 
 'huggingface,leeloo,rlhf,multimodal', 
 'Hugging Face Team', 
 'Hugging Face', 
 'Leeloo', 
 'NEUTRAL', 
 8.2, 
 7.8, 
 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b', 
 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b', 
 '{"takeaways": "Leeloo simplifies multi-modal reinforcement learning alignment for community developers.", "beginner": "Hugging Face released software that makes it easier to train AI models to understand both text and pictures.", "business": "Reduces cost of customizing visual models for corporate use-cases.", "developer": "Train a multi-modal alignment loop using Leeloo and custom DPO datasets.", "learning": "Follow the Hugging Face tutorial on aligning VLMs."}', 
 'hash_leeloo', 
 '["https://github.com/huggingface/leeloo"]'),

('Mistral AI Releases Codestral: First Dedicated Code Assistant Model', 
 'Mistral AI announced Codestral, an open-weight generative AI model designed specifically for code generation tasks. It supports 80+ programming languages.', 
 'Mistral AI launched Codestral, a 22B model optimized for coding. It excels at code completion, bug fixing, and explanation across major coding languages.', 
 'Mistral AI Blog', 
 'Mistral updates', 
 DATE_SUB(NOW(), INTERVAL 40 DAY), 
 'https://mistral.ai/news/codestral/', 
 'mistral,codestral,coding,model', 
 'Mistral Dev Relations', 
 'Mistral AI', 
 'Codestral', 
 'POSITIVE', 
 9.0, 
 8.9, 
 'https://images.unsplash.com/photo-1542831371-29b0f74f9713', 
 'https://images.unsplash.com/photo-1542831371-29b0f74f9713', 
 '{"takeaways": "Codestral delivers robust 22B code generation capabilities to local IDE extensions.", "beginner": "Mistral AI built a specialized coding brain that works with your editor to write code and find bugs.", "business": "Provides a high-quality coding assistant that can be self-hosted to protect corporate intellectual property.", "developer": "Configure VS Code with Codestral using the Continue extension.", "learning": "Build a custom code auto-completion pipeline using Codestral API."}', 
 'hash_codestral', 
 '["https://news.ycombinator.com/item?id=codestral", "https://techcrunch.com/mistral-codestral"]'),

('xAI Announces Grok-1.5 Vision with Multimodal Understanding', 
 'Elon Musks xAI has announced Grok-1.5 Vision, adding visual processing capabilities to their frontier language model with competitive performance on academic benchmarks.', 
 'xAI introduced Grok-1.5 Vision. It can process text and diagrams, documents, and real-world photographs, scoring highly on math reasoning and visual charts.', 
 'xAI Blog', 
 'xAI updates', 
 DATE_SUB(NOW(), INTERVAL 48 DAY), 
 'https://x.ai/blog/grok-1.5v', 
 'grok,xai,vision,multimodal', 
 'xAI Team', 
 'xAI', 
 'Grok-1.5V', 
 'NEUTRAL', 
 8.6, 
 8.2, 
 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa', 
 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa', 
 '{"takeaways": "Grok-1.5 Vision introduces visual and spatial understanding to xAI models.", "beginner": "Elon Musks AI company updated Grok so it can now see and understand pictures, charts, and diagrams.", "business": "Supports complex visual ingestion workflows like document auditing and diagram parsing.", "developer": "Access the xAI API to pass images along with text prompts.", "learning": "Develop a receipt-parsing application using Grok Vision API."}', 
 'hash_grok15v', 
 '["https://techcrunch.com/grok-1-5-vision", "https://news.ycombinator.com/item?id=grok-1-5v"]'),

('Google deep dives into Project Astra: The Future of AI Agents', 
 'Google demonstrated Project Astra at I/O, showcasing a real-time, conversational universal assistant that can see and hear the world via phone glasses.', 
 'Google showcased Project Astra, a multimodal real-time agent prototype. It answers spoken questions instantly, remembers objects, and processes environment changes.', 
 'Google DeepMind', 
 'Google AI updates', 
 DATE_SUB(NOW(), INTERVAL 55 DAY), 
 'https://deepmind.google/technologies/project-astra/', 
 'google,io,astra,agents', 
 'Future Tech Reporter', 
 'Google DeepMind', 
 'Project Astra', 
 'POSITIVE', 
 9.3, 
 9.1, 
 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5', 
 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5', 
 '{"takeaways": "Project Astra highlights the shift toward zero-latency conversational multi-modal agents.", "beginner": "Google showed off an AI assistant that you can talk to in real-time through your phone camera or smart glasses.", "business": "Paves the way for active hands-free industrial assistants and remote technical support.", "developer": "Explore the upcoming Gemini Live API endpoints.", "learning": "Read the Google Research paper on low-latency audio-video processing loops."}', 
 'hash_astra', 
 '["https://techcrunch.com/google-io-project-astra", "https://news.ycombinator.com/item?id=project-astra"]');

-- 4. Update the first 4 historical articles inserted by seed.sql to have correct fields (author, company, image, etc.)
UPDATE news_articles 
SET 
  author = 'Anthropic Editors', 
  ai_company = 'Anthropic', 
  thumbnail_image = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485', 
  article_image = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
  article_link = 'https://www.anthropic.com/news/claude-3-5-sonnet'
WHERE id = 1;

UPDATE news_articles 
SET 
  author = 'DeepMind Team', 
  ai_company = 'DeepMind', 
  thumbnail_image = 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e', 
  article_image = 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e',
  article_link = 'https://deepmind.google/discover/blog/introducing-alphafold-3/'
WHERE id = 2;

UPDATE news_articles 
SET 
  author = 'OpenAI Safety Board', 
  ai_company = 'OpenAI', 
  thumbnail_image = 'https://images.unsplash.com/photo-1677442136019-21780efad99a', 
  article_image = 'https://images.unsplash.com/photo-1677442136019-21780efad99a',
  article_link = 'https://openai.com/index/openai-safety-and-security-committee/'
WHERE id = 3;

UPDATE news_articles 
SET 
  author = 'Hacker News Community', 
  ai_company = 'Generic', 
  thumbnail_image = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b', 
  article_image = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
  article_link = 'https://news.ycombinator.com/item?id=40428320'
WHERE id = 4;
