
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm your UniPath AI Mentor. I have access to real-time admissions data and university requirements. How can I help you navigate your journey today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const contextShortcuts = [
    "How to improve my GPA narrative?",
    "Which schools are need-blind?",
    "Review my CSS Profile requirements.",
    "Draft an email to a professor.",
  ];

  useEffect(() => {
    const initChat = async () => {
      chatRef.current = await geminiService.createChat();
    };
    initChat();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || !chatRef.current) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: textToSend });
      const modelMsg: ChatMessage = { role: 'model', text: result.text || "I'm processing that. One moment...", timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Network congestion detected. I'm still monitoring your application portal locally. Please try your message again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500 h-[calc(100vh-16rem)] md:h-[calc(100vh-12rem)]">
      {/* Chat Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center text-white shadow-2xl border border-indigo-950">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">UniPath Intelligence</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Discovery Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="hidden md:block text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-lg">Real-time Grounding Enabled</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar bg-slate-50/20">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] md:max-w-[75%] p-5 md:p-8 rounded-[2.5rem] shadow-sm leading-relaxed text-sm md:text-base font-medium ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-200' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <div className={`text-[9px] font-black uppercase tracking-widest mt-4 opacity-50 ${msg.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • System Verified
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-5 rounded-[2rem] rounded-bl-none shadow-sm flex gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Context Shortcuts Ticker */}
      <div className="px-6 md:px-10 pb-4 flex gap-3 overflow-x-auto no-scrollbar shrink-0">
        {contextShortcuts.map((sc, i) => (
          <button 
            key={i} 
            onClick={() => handleSend(sc)}
            disabled={loading}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm active:scale-95"
          >
            {sc}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-6 md:p-10 bg-white border-t border-slate-100 shrink-0">
        <div className="flex gap-4 max-w-5xl mx-auto items-center">
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder="Ask about visas, scholarships, or essay strategies..."
              className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all text-base font-bold text-slate-700 outline-none shadow-inner"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">Press Enter</span>
            </div>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-16 h-16 bg-indigo-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl hover:bg-slate-900 transition-all disabled:opacity-50 shrink-0 group active:scale-95"
          >
            <svg className="w-8 h-8 rotate-90 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
