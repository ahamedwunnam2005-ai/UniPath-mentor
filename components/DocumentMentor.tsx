
import React, { useState, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { Feedback } from '../types';

const DocumentMentor: React.FC = () => {
  const [docType, setDocType] = useState('Common App Main Essay');
  const [content, setContent] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setAnalyzing(true);
    try {
      const res = await geminiService.analyzeDocument(docType, content);
      setFeedback(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col min-h-[700px]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Essay Submission</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Holistic Review Lab</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            >
              <option>Common App Main Essay</option>
              <option>Diversity Statement</option>
              <option>Supplemental Essay</option>
              <option>Resume / Activity List</option>
            </select>
          </div>
        </div>

        <div 
          onClick={triggerFileUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group cursor-pointer mb-6 border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
              : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
            accept=".txt,.md,.doc,.docx"
          />
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
            isDragging ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
          }`}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-slate-700 uppercase tracking-tight">Click or drag to browse files</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Supports TXT, MD, DOCX</p>
          </div>
          {isDragging && (
            <div className="absolute inset-0 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center pointer-events-none">
              <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest animate-bounce">Drop Now</span>
            </div>
          )}
        </div>

        <div className="relative flex-1 flex flex-col">
          <textarea
            className="flex-1 w-full p-6 md:p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none font-serif leading-relaxed text-slate-700 placeholder:text-slate-300 text-base shadow-inner"
            placeholder="Or paste your essay draft here... Our AI Admissions Officer will score it against Ivy League standards."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="absolute bottom-6 right-6 flex flex-wrap justify-end gap-2">
             <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
               wordCount > 650 
                ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                : 'bg-white text-indigo-600 border border-indigo-100 shadow-sm'
             }`}>
               {wordCount} Words
             </span>
             <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white text-slate-500 border border-slate-100 shadow-sm transition-all">
               {charCount.toLocaleString()} Characters
             </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            Holistic Analysis Engine: v2.4 (2026)
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !content.trim()}
            className="w-full md:w-auto px-10 py-4 bg-indigo-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-800 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {analyzing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Holistic Review
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {feedback ? (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-900" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
              
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 relative z-10">Holistic Mentor Score</p>
              <div className="text-8xl font-black text-indigo-900 mb-2 leading-none relative z-10">
                {feedback.score}<span className="text-2xl text-slate-300">/100</span>
              </div>
              <p className="text-sm font-bold text-slate-500 max-w-xs mx-auto mt-4 leading-relaxed relative z-10">
                {feedback.score > 85 ? "Ivy League potential! This narrative is compelling and unique." : "Competitive foundation. Focus on strengthening your personal 'Voice'."}
              </p>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Rubric Performance</h4>
               <div className="space-y-4">
                  {feedback.rubricScores.map((item, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-black text-slate-600 uppercase tracking-tighter">
                        <span>{item.category}</span>
                        <span>{item.score}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                          style={{ width: `${item.score}%` }} 
                        />
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-indigo-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
              </div>
              <h4 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Core Strengths Identified
              </h4>
              <ul className="space-y-4">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm font-bold text-indigo-100 flex gap-3 items-start">
                    <span className="text-emerald-400 font-black">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="h-full bg-slate-200/20 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl animate-bounce duration-[3000ms]">
              <svg className="w-10 h-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h4 className="text-2xl font-black text-slate-400 mb-3 uppercase tracking-tighter">Awaiting Draft</h4>
            <p className="text-slate-400 font-bold max-w-xs text-sm leading-relaxed">
              Upload or paste your essay to receive a holistic score, rubric breakdown, and specific strength analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentMentor;
