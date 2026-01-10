
import React, { useState, useEffect, useRef } from 'react';
import { Mentor, ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { Icons } from '../constants';

interface MentorChatProps {
  mentor: Mentor;
  onClose: () => void;
  initialMode?: 'text' | 'voice';
}

const MentorChat: React.FC<MentorChatProps> = ({ mentor, onClose, initialMode = 'text' }) => {
  const [mode, setMode] = useState<'text' | 'voice'>(initialMode);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hi! I'm ${mentor.name}. It's great to meet you! As a student at ${mentor.university}, I'd love to help you with your application journey. What's on your mind?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialMode === 'voice') {
      startVoiceSession();
    }
    return () => stopVoiceSession();
  }, []);

  const handleSendText = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const stream = await geminiService.getMentorChatStream(mentor, input);
      let fullText = "";
      for await (const chunk of stream) {
        fullText += chunk.text || "";
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'model' && last.timestamp.getTime() === userMsg.timestamp.getTime()) {
             return [...prev.slice(0, -1), { ...last, text: fullText }];
          }
          return [...prev, { role: 'model', text: fullText, timestamp: userMsg.timestamp }];
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble responding right now. Let's try again in a bit.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startVoiceSession = async () => {
    if (isVoiceActive) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = geminiService.connectToMentorLive(mentor, {
        onopen: () => {
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            if (isMuted) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm = geminiService.encodeAudio(inputData);
            sessionPromise.then(session => {
              session.sendRealtimeInput({ media: pcm });
            });
          };
          source.connect(processor);
          processor.connect(audioContextRef.current!.destination);
          setIsVoiceActive(true);
        },
        onmessage: async (msg: any) => {
          const base64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64 && outputContextRef.current) {
            const audioData = geminiService.decodeAudio(base64);
            const buffer = await geminiService.decodeAudioData(audioData, outputContextRef.current, 24000);
            const source = outputContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(outputContextRef.current.destination);
            
            const now = outputContextRef.current.currentTime;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            
            audioSourcesRef.current.add(source);
            source.onended = () => audioSourcesRef.current.delete(source);
          }
          if (msg.serverContent?.interrupted) {
            audioSourcesRef.current.forEach(s => {
              try { s.stop(); } catch(e) {}
            });
            audioSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setIsVoiceActive(false),
        onerror: (e: any) => {
          console.error("Live Error:", e);
          setIsVoiceActive(false);
        },
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error("Call initialization failed:", err);
      alert("Microphone access is required for the mentor call.");
    }
  };

  const stopVoiceSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();
    
    audioSourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsVoiceActive(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[90vh] md:h-[80vh] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden relative border border-slate-200">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border-4 border-indigo-500 shadow-xl group cursor-pointer">
                <img src={mentor.imageUrl} alt={mentor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-sm" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{mentor.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                <span className="text-indigo-600">{mentor.university}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span>{mentor.major}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <button 
                onClick={() => { stopVoiceSession(); setMode('text'); }}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'text' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Text Chat
              </button>
              <button 
                onClick={() => { setMode('voice'); startVoiceSession(); }}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'voice' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Voice Call
              </button>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm active:scale-95"
            >
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/20 relative">
          {mode === 'text' ? (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-6 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[80%] p-6 rounded-[2.5rem] shadow-sm text-sm font-medium leading-relaxed ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                    }`}>
                      {msg.text}
                      <div className={`text-[9px] mt-2 font-black uppercase tracking-tighter opacity-40 ${msg.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-5 rounded-[2rem] rounded-bl-none shadow-sm flex gap-2">
                       <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                       <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                       <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 md:p-10 bg-white border-t border-slate-100">
                <div className="flex gap-4 max-w-4xl mx-auto">
                  <input
                    type="text"
                    placeholder={`Type your message for ${mentor.name.split(' ')[0]}...`}
                    className="flex-1 px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all text-base font-bold text-slate-700 outline-none shadow-inner"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                  />
                  <button
                    onClick={handleSendText}
                    disabled={!input.trim() || isTyping}
                    className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 shrink-0 active:scale-95"
                  >
                    <svg className="w-7 h-7 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-16">
               <div className="relative group">
                  <div className={`w-56 h-56 md:w-72 md:h-72 rounded-[4.5rem] border-8 border-indigo-50/50 flex items-center justify-center transition-all duration-700 ${isVoiceActive ? 'scale-110 shadow-[0_0_100px_rgba(79,70,229,0.4)]' : 'scale-100 shadow-2xl'}`}>
                     <img src={mentor.imageUrl} alt={mentor.name} className="w-full h-full object-cover rounded-[4rem]" />
                  </div>
                  
                  {isVoiceActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       {[...Array(4)].map((_, i) => (
                         <div 
                           key={i} 
                           className="absolute inset-0 border-4 border-indigo-500 rounded-[4.5rem] animate-ping opacity-40" 
                           style={{ animationDelay: `${i * 0.7}s`, animationDuration: '4s' }} 
                         />
                       ))}
                    </div>
                  )}

                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{isVoiceActive ? "Live Session" : "Offline"}</span>
                  </div>
               </div>

               <div className="space-y-6 max-w-lg">
                  <h4 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                    {isVoiceActive ? `Speaking with ${mentor.name.split(' ')[0]}` : "Initialize Voice Call"}
                  </h4>
                  <p className="text-slate-500 font-bold text-sm leading-relaxed">
                    Ask about their application strategy, ${mentor.university} campus culture, or major-specific interviews. Your conversation is secure and processed in real-time.
                  </p>
               </div>

               <div className="flex items-center gap-8">
                 <button 
                   onClick={toggleMute}
                   className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-xl ${isMuted ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                 >
                   {isMuted ? (
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 3 3 3 0 01-3-3V5a3 3 0 013-3z M3 3l18 18" /></svg>
                   ) : (
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 3 3 3 0 01-3-3V5a3 3 0 013-3z" /></svg>
                   )}
                 </button>

                 <button
                   onClick={isVoiceActive ? stopVoiceSession : startVoiceSession}
                   className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center transition-all shadow-2xl active:scale-95 ${isVoiceActive ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                 >
                   {isVoiceActive ? (
                     <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                   ) : (
                     <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 3 3 3 0 01-3-3V5a3 3 0 013-3z" /></svg>
                   )}
                 </button>

                 <button 
                   onClick={() => setMode('text')}
                   className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-all shadow-xl"
                 >
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                 </button>
               </div>
               
               {isVoiceActive && (
                 <div className="flex gap-1.5 items-center h-12 pt-8">
                   {[...Array(12)].map((_, i) => (
                     <div 
                       key={i} 
                       className="w-2 bg-indigo-600 rounded-full animate-wave shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                       style={{ 
                         height: `${20 + Math.random() * 80}%`, 
                         animationDelay: `${i * 0.1}s`,
                         animationDuration: '0.6s'
                       }} 
                     />
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0 px-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              End-to-End Secure
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Icons.Star className="w-3 h-3 text-indigo-400" />
              Priority Peer Access
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            Powered by <span className="text-indigo-600 font-black not-italic">Gemini 2.5 Live</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .animate-wave {
          animation: wave infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MentorChat;
