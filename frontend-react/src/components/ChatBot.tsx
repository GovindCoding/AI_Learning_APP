import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Brain, Sparkles, Code } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  code?: string;
}

export const ChatBot: React.FC = () => {
  const { user } = useAuth();
  const { tools, nodes } = useLearning();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'assistant', 
      text: `Hello ${user?.username || 'Learner'}! I am your AI Mentor. How can I assist your AI learning journey today?` 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Web Speech API references
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const generateAIResponse = (input: string): { text: string; code?: string } => {
    const normalized = input.toLowerCase();

    if (normalized.includes('project') || normalized.includes('exercise')) {
      return {
        text: "Here is a personalized Generative AI Mini-Project idea for your level:\n\n**AI PDF Summarizer & Q&A Assistant**\n- **Difficulty**: Intermediate\n- **Stack**: Python, LangChain, Pinecone Vector Database, OpenAI API.\n- **Task**: Load a PDF, segment text, write to Pinecone, retrieve matching chunks, and synthesize answers using GPT-4o.",
        code: `import os\nfrom langchain_community.document_loaders import PyPDFLoader\nfrom langchain_text_splitters import RecursiveCharacterTextSplitter\nfrom langchain_openai import OpenAIEmbeddings, ChatOpenAI\nfrom langchain_community.vectorstores import Pinecone\n\n# Load and Split Document\nloader = PyPDFLoader("paper.pdf")\npages = loader.load()\ntext_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)\ndocs = text_splitter.split_documents(pages)\n\n# Embed and Store in Vector DB\nembeddings = OpenAIEmbeddings()\nvector_db = Pinecone.from_documents(docs, embeddings, index_name="ai-learning")`
      };
    }

    if (normalized.includes('rag') || normalized.includes('retrieval')) {
      return {
        text: "Retrieval-Augmented Generation (RAG) is a technique that extends LLM knowledge by pulling relevant facts from external data sources (like PDFs, DBs, or Webpages) and feeding them inside the prompt context. This drastically limits hallucinations.",
        code: `# High-level flow\nContext = retrieve_docs_from_vector_store(user_query)\nPrompt = f"Using this context: {Context}. Answer: {user_query}"\nResponse = llm.generate(Prompt)`
      };
    }

    if (normalized.includes('tool') || normalized.includes('model') || normalized.includes('recommend')) {
      const topTool = tools[1] || { name: 'Claude 3.5 Sonnet', category: 'LLMs' };
      return {
        text: `I recommend checking out **${topTool.name}** under the **${topTool.category}** category. It currently has a popularity score of ${topTool.popularityScore} and community rating of ${topTool.communityRating}. It performs extremely well for writing and explaining code!`
      };
    }

    if (normalized.includes('help') || normalized.includes('learn') || normalized.includes('roadmap')) {
      const nextNode = nodes.find(n => n.status !== 'COMPLETED') || { title: 'AI Foundations' };
      return {
        text: `Based on your goal, you should focus on your next pending roadmap module: **${nextNode.title}**. Completing it will earn you 200 XP and bring you closer to leveling up! Let me know if you want me to explain any specific subtopic inside it.`
      };
    }

    return {
      text: "That is an interesting topic! I recommend studying the core concepts in the 'Learning Modules' section, taking the quizzes to validate your knowledge, and using libraries like PyTorch or LangChain to construct hands-on AI wrappers."
    };
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = { sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI typing response
    setTimeout(() => {
      const aiReply = generateAIResponse(userMessage.text);
      setMessages(prev => [...prev, { sender: 'assistant', text: aiReply.text, code: aiReply.code }]);
    }, 800);
  };

  const triggerQuickPrompt = (prompt: string) => {
    setInputText(prompt);
    setTimeout(() => {
      // Small trigger delay
      const userMessage: Message = { sender: 'user', text: prompt };
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setTimeout(() => {
        const aiReply = generateAIResponse(prompt);
        setMessages(prev => [...prev, { sender: 'assistant', text: aiReply.text, code: aiReply.code }]);
      }, 700);
    }, 50);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Collapsed Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center text-white shadow-neon-cyan hover:scale-110 active:scale-95 transition-all duration-300 relative group animate-bounce"
        >
          <Brain className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
          
          {/* Tooltip */}
          <span className="absolute right-20 bg-slate-900/90 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-neon-cyan/20 pointer-events-none whitespace-nowrap">
            Ask AI Mentor
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-[420px] h-[550px] glass-panel rounded-3xl border border-borderBg-light dark:border-borderBg-dark shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-borderBg-light dark:border-borderBg-dark bg-gradient-to-r from-neon-cyan/10 to-neon-violet/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <span className="text-[10px] text-neon-cyan flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Online AI Mentor
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400 hover:text-slate-250" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-neon-cyan to-neon-violet text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800/60 border border-borderBg-light dark:border-borderBg-dark rounded-tl-none text-slate-850 dark:text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  
                  {msg.code && (
                    <div className="mt-3 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 font-mono text-xs text-neon-cyan p-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1.5 mb-1.5 border-b border-slate-800">
                        <span className="flex items-center gap-1"><Code className="w-3 h-3" /> Python Snippet</span>
                        <span>Copy</span>
                      </div>
                      <pre className="overflow-x-auto">{msg.code}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              <button 
                onClick={() => triggerQuickPrompt("Explain RAG retrieval")}
                className="text-[11px] px-2.5 py-1.5 rounded-full border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/40 bg-slate-100/50 dark:bg-slate-800/30 text-slate-400 hover:text-neon-cyan transition-colors"
              >
                Explain RAG
              </button>
              <button 
                onClick={() => triggerQuickPrompt("Suggest a hands-on AI project")}
                className="text-[11px] px-2.5 py-1.5 rounded-full border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/40 bg-slate-100/50 dark:bg-slate-800/30 text-slate-400 hover:text-neon-cyan transition-colors"
              >
                Suggest a Project
              </button>
              <button 
                onClick={() => triggerQuickPrompt("Recommend a coding LLM")}
                className="text-[11px] px-2.5 py-1.5 rounded-full border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/40 bg-slate-100/50 dark:bg-slate-800/30 text-slate-400 hover:text-neon-cyan transition-colors"
              >
                Recommend LLM
              </button>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-borderBg-light dark:border-borderBg-dark flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all duration-300 ${
                isListening 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse' 
                  : 'border-borderBg-light dark:border-borderBg-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Type a question...'}
              disabled={isListening}
              className="flex-1 bg-slate-100 dark:bg-slate-800/50 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan transition-all"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white shadow-neon-cyan hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
export default ChatBot;
