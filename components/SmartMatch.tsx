
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { Icons } from '../constants';
import { University } from '../types';

interface SmartMatchProps {
  initialProfile?: {
    name: string;
    country: string;
    level: string;
    field: string;
    gpa: string;
  };
  onTrack?: (uni: University) => void;
  trackingIds?: string[];
}

const SmartMatch: React.FC<SmartMatchProps> = ({ initialProfile, onTrack, trackingIds = [] }) => {
  const [profile, setProfile] = useState(initialProfile || { name: '', country: '', level: '', field: '', gpa: '' });
  const [results, setResults] = useState<{ universities: any[], scholarships: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const isFormComplete = profile.name && profile.country && profile.level && profile.field && profile.gpa;

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) return;
    setLoading(true);
    try {
      const data = await geminiService.getSmartMatches(profile);
      setResults(data);
    } catch (err) {
      console.error(err);
      alert("Admissions engine is busy. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackUni = (uni: any) => {
    if (!onTrack) return;
    const universityObject: University = {
      id: `smart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: uni.name,
      location: uni.location || 'Global',
      state: uni.state || '',
      rank: uni.rank || 0,
      tags: uni.tags || [],
      imageUrl: uni.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?auto=format&fit=crop&q=80&w=800',
      financialAidType: (uni.financialAidType as any) || 'Need-Aware',
      isCommonApp: uni.isCommonApp || false,
      region: uni.region || 'Global',
      country: uni.country || 'Global',
      applyUrl: uni.applyUrl,
      isExternal: true
    };
    onTrack(universityObject);
  };

  const getFitBadgeStyle = (type: string) => {
    switch (type) {
      case 'Safety': return 'bg-green-50 text-green-700 border-green-100';
      case 'Target': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Reach': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Alternative Pathway': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-20">
      {/* Smart Match Form Card */}
      <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Icons.Sparkles /></div>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
            <Icons.Sparkles />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-2">Web-Connected Smart Match</h3>
            <p className="text-sm font-bold text-slate-400">Discover realistic global pathways through real-time web intelligence.</p>
          </div>
        </div>

        <form onSubmit={handleMatch} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Scholar Name</label>
              <input
                type="text"
                placeholder="e.g. Samuel Okoro"
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country of Origin</label>
              <input
                type="text"
                placeholder="e.g. Nigeria"
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Level</label>
              <select
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 outline-none appearance-none"
                value={profile.level}
                onChange={(e) => setProfile({ ...profile, level: e.target.value })}
              >
                <option value="">Select Level</option>
                <option>Undergraduate (Bachelor's)</option>
                <option>Graduate (Master's)</option>
                <option>Doctorate (PhD)</option>
                <option>Transfer Student</option>
              </select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Intended Field of Study</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                value={profile.field}
                onChange={(e) => setProfile({ ...profile, field: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weighted GPA</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 3.9/4.0"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-indigo-50 border-2 border-indigo-100 focus:border-indigo-500 focus:bg-white transition-all font-black text-indigo-900 outline-none"
                  value={profile.gpa}
                  onChange={(e) => setProfile({ ...profile, gpa: e.target.value })}
                />
                <div className="absolute right-4 top-4 text-indigo-300">
                  <Icons.Star />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className={`w-2 h-2 rounded-full ${isFormComplete ? 'bg-green-500' : 'bg-rose-500 animate-pulse'}`} />
              {isFormComplete ? 'Intelligence Engine Ready' : 'Awaiting Profile Credentials'}
            </div>
            <button
              type="submit"
              disabled={loading || !isFormComplete}
              className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Competitiveness...
                </>
              ) : (
                <>
                  <Icons.Sparkles />
                  Run Admissions Probability Match
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Deck */}
      {results ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
          {/* Universities Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">University Admission Chances</h4>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {results.universities.map((uni, i) => (
                <div key={i} className={`bg-white p-8 rounded-[3rem] border-2 transition-all group relative overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl ${uni.isAlternative ? 'border-blue-400 bg-blue-50/10' : 'border-slate-100 hover:border-indigo-600'}`}>
                  {uni.isAlternative && (
                    <div className="absolute top-0 right-0">
                      <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">Recommended Path</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getFitBadgeStyle(uni.type)}`}>
                      {uni.type || 'Match'}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Probability</p>
                      <p className={`text-xl font-black leading-none ${uni.probability > 80 ? 'text-green-600' : uni.probability > 50 ? 'text-indigo-600' : 'text-amber-600'}`}>{uni.probability}%</p>
                    </div>
                  </div>

                  {/* Chance Indicator Bar */}
                  <div className="h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${uni.probability > 80 ? 'bg-green-500' : uni.probability > 50 ? 'bg-indigo-500' : 'bg-amber-500'}`} 
                      style={{ width: `${uni.probability}%` }}
                    />
                  </div>
                  
                  <h5 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
                    {uni.name}
                  </h5>
                  
                  <div className="space-y-4 flex-1">
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Matching Rationale:</p>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{uni.reasoning}"</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                    <div>
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-1 ${uni.isAlternative ? 'text-blue-600' : 'text-indigo-600'}`}>
                        <Icons.Sparkles /> Win Strategy
                      </p>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">
                        {uni.strategy}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {uni.applyUrl && (
                        <a 
                          href={uni.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg group/btn"
                        >
                          Visit Official Portal
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] bg-white/10 px-1.5 rounded font-black">OFFICIAL</span>
                            <Icons.ChevronRight />
                          </div>
                        </a>
                      )}
                      
                      {onTrack && (
                        <button 
                          onClick={() => handleTrackUni(uni)}
                          disabled={trackingIds.some(id => id === uni.id) || trackingIds.some(id => id.includes(uni.name))}
                          className={`w-full py-3.5 border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            trackingIds.some(id => id.includes(uni.name))
                            ? 'bg-green-50 border-green-500 text-green-600'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-600 hover:text-indigo-600'
                          }`}
                        >
                          {trackingIds.some(id => id.includes(uni.name)) ? (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              In Tracker
                            </>
                          ) : (
                            <>Track Institution</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Scholarships Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h4 className="text-xl font-black text-green-600 uppercase tracking-tighter">Funding Win Probability</h4>
              <div className="h-px flex-1 bg-green-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {results.scholarships.map((sch, i) => (
                <div key={i} className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-150 transition-transform duration-700">
                    <Icons.Cash />
                  </div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-green-500/20">
                      <Icons.Cash />
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        <p className="text-[10px] font-black text-green-400 uppercase mb-0.5">Win Chance</p>
                        <p className="text-2xl font-black text-white">{sch.probability}%</p>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full w-24 ml-auto overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${sch.probability}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <h5 className="text-xl font-black uppercase tracking-tighter">{sch.name}</h5>
                    <div className="flex items-center gap-2">
                       <span className="bg-white/10 text-[8px] px-2 py-0.5 rounded uppercase font-black tracking-widest border border-white/10 flex items-center gap-1">
                         <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                         Verified Discovery
                       </span>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Support: {sch.amount}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">Deadline: {sch.deadline || "TBD"}</p>
                  
                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 relative z-10 mb-6">
                    <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-2">Scholarship Fit Analysis:</p>
                    <p className="text-xs font-medium text-slate-200 leading-relaxed italic">
                      {sch.whyFit}
                    </p>
                  </div>

                  {sch.applyUrl && (
                    <a 
                      href={sch.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all flex items-center justify-center gap-2 shadow-lg relative z-10 active:scale-95"
                    >
                       Visit Official Scholarship Site
                       <Icons.ChevronRight />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="text-center p-12 bg-indigo-50 rounded-[3rem] border border-indigo-100 relative overflow-hidden group">
             <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700" />
             <h4 className="text-xl font-black text-indigo-900 uppercase tracking-tighter mb-2">Next Steps for {profile.name}</h4>
             <p className="text-xs font-bold text-indigo-700 max-w-xl mx-auto leading-relaxed">
               Admissions analysis complete. Based on your Weighted GPA ({profile.gpa}) and target field ({profile.field}), we have verified the best global pathways currently open for international applicants. Use the buttons above to add these to your tracking portal or visit their official application sites.
             </p>
             <button 
              onClick={() => setResults(null)}
              className="mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
             >
               Start New Matching Cycle
             </button>
          </div>
        </div>
      ) : (
        <div className="py-24 text-center space-y-4 max-w-md mx-auto opacity-50">
          <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border-4 border-dashed border-slate-200">
            <Icons.Sparkles />
          </div>
          <h4 className="text-2xl font-black text-slate-400 uppercase tracking-tighter leading-none">Global Match Required</h4>
          <p className="text-slate-400 font-bold text-sm leading-relaxed">
            Fill in your academic profile to let UniPath's crawler search for your highest-probability university and funding matches across 40+ countries.
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartMatch;
