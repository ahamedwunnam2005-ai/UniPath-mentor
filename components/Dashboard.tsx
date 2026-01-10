
import React, { useState, useMemo, useEffect } from 'react';
import { ApplicationStep, University, Scholarship, UserProfile } from '../types';
import { Icons } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { geminiService } from '../services/geminiService';
import { supabaseService } from '../services/supabaseService';

interface DashboardProps {
  user: UserProfile;
  onUpdateUser?: (user: UserProfile) => void;
  onEngage: () => void;
  steps: ApplicationStep[];
  universities: University[];
  scholarships: Scholarship[];
  isGeneratingRoadmap?: boolean;
  onToggleStep?: (id: string) => void;
}

type DeadlineItem = {
  id: string;
  title: string;
  date: string;
  type: 'Application' | 'Scholarship';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  link?: string;
};

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onUpdateUser,
  onEngage, 
  steps, 
  universities, 
  scholarships, 
  isGeneratingRoadmap = false,
  onToggleStep
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'priority'>('date');
  const [isGeneratingVision, setIsGeneratingVision] = useState(false);
  const [mentorBriefing, setMentorBriefing] = useState<string>("");
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const inProgressCount = steps.filter(s => s.status === 'in-progress').length;
  const pendingCount = steps.filter(s => s.status === 'pending').length;

  const chartData = useMemo(() => [
    { name: 'Completed', value: completedCount, color: '#22c55e' },
    { name: 'In Progress', value: inProgressCount, color: '#4f46e5' },
    { name: 'Pending', value: pendingCount, color: '#e2e8f0' },
  ], [completedCount, inProgressCount, pendingCount]);

  const unifiedDeadlines = useMemo(() => {
    const items: DeadlineItem[] = [
      ...steps.map(s => ({
        id: s.id,
        title: s.title,
        date: s.dueDate,
        type: 'Application' as const,
        priority: s.urgency as any,
        status: s.status,
        link: s.link
      })),
      ...scholarships.map(s => ({
        id: s.id,
        title: s.name,
        date: s.deadline,
        type: 'Scholarship' as const,
        priority: 'high' as const,
        status: 'pending' as const,
        link: s.applyUrl
      }))
    ];

    return items.sort((a, b) => {
      if (sortBy === 'date') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      if (sortBy === 'priority') {
        const pMap = { high: 0, medium: 1, low: 2 };
        return pMap[a.priority] - pMap[b.priority];
      }
      return 0;
    });
  }, [steps, scholarships, sortBy]);

  const nextMajorDeadline = useMemo(() => {
    const pending = unifiedDeadlines.filter(d => d.status !== 'completed');
    return pending.length > 0 ? pending[0] : null;
  }, [unifiedDeadlines]);

  useEffect(() => {
    if (user.engagementStatus === 'engaged' && !mentorBriefing) {
      fetchMentorBriefing();
    }
  }, [user.engagementStatus]);

  const fetchMentorBriefing = async () => {
    setIsLoadingBriefing(true);
    try {
      const chat = await geminiService.createChat();
      const response = await chat.sendMessage({ 
        message: `Generate a 2-sentence "Admissions Officer Briefing" for ${user.name}. 
        Status: ${completedCount}/${steps.length} milestones complete. 
        Target Major: ${user.targetMajor}. 
        Next deadline: ${nextMajorDeadline?.title} on ${nextMajorDeadline?.date}. 
        Make it professional, urgent, and encouraging.` 
      });
      setMentorBriefing(response.text || "");
    } catch (e) {
      setMentorBriefing("Your admissions journey is in progress. Focus on your upcoming deadlines to maintain competitive momentum.");
    } finally {
      setIsLoadingBriefing(false);
    }
  };

  const handleGenerateVision = async () => {
    setIsGeneratingVision(true);
    try {
      const imageUrl = await geminiService.generateVisionImage(user);
      const updatedUser = { ...user, visionImageUrl: imageUrl };
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      } else {
        await supabaseService.syncProfile(updatedUser);
      }
    } catch (err) {
      console.error(err);
      alert("AI Vision generation failed. Check your admissions criteria.");
    } finally {
      setIsGeneratingVision(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };

  const isIdle = user.engagementStatus === 'idle';

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* AI Intelligence Header */}
      {user.engagementStatus === 'engaged' && (
        <div className="bg-indigo-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-indigo-950 group">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
            <Icons.Sparkles />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl border border-white/10 animate-pulse">
               <Icons.Message />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-2">Mentor Intelligence Briefing</h3>
              {isLoadingBriefing ? (
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded-full w-1/2 animate-pulse" />
                </div>
              ) : (
                <p className="text-xl md:text-2xl font-black text-indigo-50 leading-tight tracking-tight">
                  "{mentorBriefing || 'Welcome back, scholar. Your global application pipeline is active and monitoring real-time deadlines.'}"
                </p>
              )}
            </div>
            <button 
              onClick={fetchMentorBriefing}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
            >
              <svg className="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Primary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Globe />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Schools</p>
              <p className="text-3xl font-black text-slate-900">{universities.length}</p>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 hover:border-emerald-300 transition-all group">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Status />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Milestones</p>
              <p className="text-3xl font-black text-slate-900">{completedCount}<span className="text-sm text-slate-300 font-bold ml-1">/ {steps.length}</span></p>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 hover:border-rose-300 transition-all group">
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Cash />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scholarships</p>
              <p className="text-3xl font-black text-slate-900">{scholarships.length}</p>
            </div>
          </div>

          {/* Timeline Center */}
          <div className="bg-white p-6 md:p-10 rounded-[3.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
            {isIdle && (
              <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                {isGeneratingRoadmap ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl animate-spin">
                      <Icons.Sparkles />
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Simulating Pathways</h4>
                    <p className="text-slate-500 font-bold max-w-sm mb-8 leading-relaxed">
                      Gemini is deep-scanning admissions patterns for ${user.targetMajor} at Tier-1 institutions...
                    </p>
                  </div>
                ) : (
                  <div className="max-w-md">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-indigo-100 mx-auto">
                      <Icons.Sparkles />
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-3 leading-none">Activate Global Pipeline</h4>
                    <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                      Initialize your personalized roadmap. We'll crawl international portals to match deadlines with your profile criteria.
                    </p>
                    <button 
                      onClick={onEngage}
                      className="w-full py-5 bg-indigo-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-slate-900 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      Initialize AI Tracking
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                   <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                   Admissions Command Center
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time verification pipeline</p>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                {(['date', 'priority'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      sortBy === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {unifiedDeadlines.map((item) => (
                <div 
                  key={item.id} 
                  className={`group flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[2rem] border transition-all ${
                    item.status === 'completed' 
                      ? 'bg-slate-50 border-transparent opacity-60' 
                      : 'bg-white border-slate-100 hover:border-indigo-600 hover:shadow-xl'
                  }`}
                >
                  <div 
                    onClick={() => item.type === 'Application' && onToggleStep?.(item.id)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer group-hover:scale-105 ${
                    item.status === 'completed' ? 'bg-green-100 border-green-500 text-green-600' :
                    item.priority === 'high' ? 'bg-rose-50 border-rose-500 text-rose-600 animate-pulse' :
                    'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {item.status === 'completed' ? (
                       <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : item.type === 'Scholarship' ? <Icons.Cash /> : <Icons.FileText />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.type === 'Scholarship' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                         {item.type}
                       </span>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">• {item.priority}</span>
                    </div>
                    <h4 className={`text-lg font-black text-slate-900 tracking-tight leading-none mb-2 ${item.status === 'completed' ? 'line-through' : ''}`}>
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                          <Icons.Status />
                          Due {formatDate(item.date)}
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase">
                          <Icons.Globe />
                          Verified Path
                       </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {item.link ? (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                      >
                         Launch Portal <Icons.ChevronRight />
                      </a>
                    ) : (
                      <span className="text-[9px] font-black text-slate-300 uppercase italic">Local Milestone</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
           {/* Visual Goal Card */}
           <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-200 overflow-hidden relative group">
              <h3 className="text-base font-black text-slate-800 mb-6 uppercase tracking-widest">Admissions Vision</h3>
              
              <div className="relative aspect-square rounded-[2rem] bg-slate-50 border border-slate-100 overflow-hidden mb-6 shadow-inner">
                {user.visionImageUrl ? (
                  <img 
                    src={user.visionImageUrl} 
                    alt="Target Vision" 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
                     <div className="w-16 h-16 bg-slate-200 rounded-3xl flex items-center justify-center mb-4"><Icons.Sparkles /></div>
                     <p className="text-[10px] font-black uppercase tracking-widest">Vision Locked</p>
                  </div>
                )}
                {isGeneratingVision && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20 animate-in fade-in">
                    <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Rendering Manifestation...</p>
                  </div>
                )}
              </div>

              <button 
                onClick={handleGenerateVision}
                disabled={isGeneratingVision}
                className="w-full py-4 bg-indigo-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-950 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
              >
                <Icons.Sparkles /> {user.visionImageUrl ? "Refresh AI Goal" : "Generate Graduation Vision"}
              </button>
           </div>

           {/* Performance Analytics */}
           <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-200">
              <h3 className="text-base font-black text-slate-800 mb-8 uppercase tracking-widest">Pipeline Health</h3>
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={chartData} 
                      cx="50%" cy="50%" 
                      innerRadius={60} outerRadius={90} 
                      paddingAngle={10} dataKey="value"
                    >
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-900">{Math.round((completedCount / (steps.length || 1)) * 100)}%</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Complete</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-8">
                 {chartData.map(d => (
                   <div key={d.name} className="text-center space-y-1">
                      <div className="w-1.5 h-1.5 rounded-full mx-auto" style={{ backgroundColor: d.color }} />
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{d.name}</p>
                      <p className="text-xs font-black text-slate-900">{d.value}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Recommended Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
             <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
             Strategic School Selection
          </h3>
          <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Manage All</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {universities.map(uni => (
            <div key={uni.id} className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
               <img src={uni.imageUrl} alt={uni.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{uni.country}</p>
                  <h4 className="text-xs font-black text-white leading-tight mb-2 group-hover:text-indigo-200 transition-colors line-clamp-2">{uni.name}</h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                     <span className="text-[7px] font-black text-white/40 uppercase">Rank #{uni.rank}</span>
                     <Icons.ChevronRight />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
