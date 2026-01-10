import React, { useState, useMemo } from 'react';
import { MOCK_SCHOLARSHIPS, Icons } from '../constants';
import { geminiService } from '../services/geminiService';
import { Scholarship } from '../types';

const Scholarships: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<'Global' | 'Europe' | 'North America'>('Global');
  const [searchQuery, setSearchQuery] = useState('');
  const [advice, setAdvice] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState<{ [id: string]: boolean }>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Living Search State
  const [externalScholarships, setExternalScholarships] = useState<Scholarship[]>([]);
  const [webInsights, setWebInsights] = useState<string | null>(null);
  const [webSources, setWebSources] = useState<{ uri: string, title: string }[]>([]);
  const [isDeepScanning, setIsDeepScanning] = useState(false);

  // Blended & Ranked Sorting Logic
  const filtered = useMemo(() => {
    const s = searchQuery.trim().toLowerCase();
    
    // Inclusion match from mock + external
    const combined = [...MOCK_SCHOLARSHIPS, ...externalScholarships].filter(sch => {
      const matchesRegion = selectedRegion === 'Global' || sch.region === selectedRegion;
      const matchesSearch = !s || 
                            sch.name.toLowerCase().includes(s) ||
                            sch.provider.toLowerCase().includes(s) ||
                            sch.focus.toLowerCase().includes(s) ||
                            sch.description.toLowerCase().includes(s);
      return matchesRegion && matchesSearch;
    });

    if (!s) return combined;

    // Prioritize exact matches and prefix matches
    return combined.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // 1. Exact Name Match
      const aExact = aName === s;
      const bExact = bName === s;
      if (aExact !== bExact) return aExact ? -1 : 1;

      // 2. Name Starts With
      const aStarts = aName.startsWith(s);
      const bStarts = bName.startsWith(s);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;

      // 3. Fallback to alphabetically
      return aName.localeCompare(bName);
    });
  }, [searchQuery, selectedRegion, externalScholarships]);

  const handleDeepScan = async () => {
    if (!searchQuery.trim()) return;
    setIsDeepScanning(true);
    
    try {
      const [webInfo, liveSchs] = await Promise.all([
        geminiService.searchScholarshipsWeb(searchQuery),
        geminiService.fetchExternalScholarships(searchQuery)
      ]);

      setWebInsights(webInfo.text);
      setWebSources(webInfo.sources);
      
      setExternalScholarships(prev => {
        const mockNames = new Set(MOCK_SCHOLARSHIPS.map(m => m.name.toLowerCase()));
        const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
        
        const newResults = liveSchs.filter(f => {
          const lowName = f.name.toLowerCase();
          return !mockNames.has(lowName) && !existingNames.has(lowName);
        });
        
        return [...prev, ...newResults];
      });
    } catch (err) {
      console.error(err);
      setWebInsights("Web scan encountered an error. Please try again.");
    } finally {
      setIsDeepScanning(false);
    }
  };

  const getAdvice = async (scholarship: Scholarship) => {
    if (advice[scholarship.id]) return;
    setLoading(prev => ({ ...prev, [scholarship.id]: true }));
    try {
      const res = await geminiService.getScholarshipAdvice(scholarship.name);
      setAdvice(prev => ({ ...prev, [scholarship.id]: res }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, [scholarship.id]: false }));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Living Discovery Search Bar */}
      <div className="bg-white p-4 md:p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search global funding or deep scan the web..."
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 transition-all text-sm md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDeepScan()}
              />
              <div className="absolute left-4 top-4.5 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button 
              onClick={handleDeepScan}
              disabled={isDeepScanning || !searchQuery.trim()}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isDeepScanning ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Icons.Sparkles /> AI Web Discovery</>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {['Global', 'Europe', 'North America'].map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r as any)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 border ${
                selectedRegion === r ? 'bg-indigo-900 border-indigo-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Hub Insights */}
      {webInsights && (
        <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
           <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-indigo-600 uppercase tracking-tighter flex items-center gap-2">
                 <Icons.Sparkles /> Web Discovery Intelligence
              </h3>
              <div className="h-px flex-1 bg-indigo-100" />
           </div>
           
           <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-700">
                 <Icons.Cash />
              </div>
              <div className="prose prose-invert max-w-none text-indigo-100 leading-relaxed whitespace-pre-wrap font-serif text-sm md:text-base mb-10 opacity-90">
                {webInsights}
              </div>

              {webSources.length > 0 && (
                <div className="pt-8 border-t border-white/10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-5">Verified Admissions Sources</p>
                  <div className="flex flex-wrap gap-3">
                    {webSources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-indigo-200 hover:text-white transition-all flex items-center gap-2 uppercase tracking-widest"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Blended Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[400px]">
        {filtered.length > 0 ? (
          filtered.map(s => (
            <div key={s.id} className={`bg-white rounded-[2.5rem] border transition-all duration-500 group flex flex-col relative overflow-hidden ${
              s.isExternal 
                ? 'border-indigo-100 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100/50' 
                : 'border-slate-200 hover:border-indigo-600 hover:shadow-xl'
            }`}>
              {/* External Result Badge */}
              {s.isExternal && (
                <div className="absolute top-0 right-0 z-10">
                   <div className="px-5 py-2 bg-indigo-600 text-white rounded-bl-[1.5rem] text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                     <Icons.Sparkles /> Web Discovery
                   </div>
                </div>
              )}

              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                    s.isExternal ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-green-50 border-green-100 text-green-600'
                  } group-hover:scale-110 shadow-sm`}>
                    <Icons.Cash />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Support Level</p>
                    <p className={`text-lg font-black ${s.isExternal ? 'text-indigo-600' : 'text-green-600'}`}>{s.amount}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.deadline}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="text-2xl font-black text-slate-800 mb-1 uppercase tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors">
                    {s.name}
                  </h4>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 group-hover:text-slate-600">{s.provider}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                        {s.focus}
                    </span>
                    <span className="px-4 py-1.5 bg-indigo-50/50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                        {s.region}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity line-clamp-2">
                    {s.description}
                  </p>
                </div>

                <div className="space-y-4 mt-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => toggleExpand(s.id)}
                      className={`py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${
                        expandedId === s.id 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                        : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-600 hover:text-indigo-600'
                      }`}
                    >
                      {expandedId === s.id ? 'Close Details' : 'View Full Breakdown'}
                    </button>
                    <a 
                      href={s.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-4 px-6 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                    >
                      Apply Now <Icons.ChevronRight />
                    </a>
                  </div>

                  {/* Enhanced Collapsible Detailed Section */}
                  {expandedId === s.id && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-8 animate-in slide-in-from-top-4 duration-500">
                      {/* Funding Stack Visualization */}
                      <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <Icons.Cash /> Funding Stack Breakdown
                        </h5>
                        <div className="space-y-4">
                           <div className="space-y-2">
                             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                               <span className="text-slate-500">Tuition Coverage</span>
                               <span className="text-indigo-600">100% Guaranteed</span>
                             </div>
                             <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-600 rounded-full" style={{ width: '100%' }} />
                             </div>
                           </div>
                           <div className="space-y-2">
                             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                               <span className="text-slate-500">Living Stipend</span>
                               <span className="text-emerald-600">Tier-1 Monthly</span>
                             </div>
                             <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                             </div>
                           </div>
                           <div className="space-y-2">
                             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                               <span className="text-slate-500">Relocation / Travel</span>
                               <span className="text-amber-600">Full Coverage</span>
                             </div>
                             <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                               <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }} />
                             </div>
                           </div>
                        </div>
                        <div className="mt-6 p-4 bg-white/60 rounded-2xl border border-white/80">
                           <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic">
                             {s.fundingBreakdown || "Standard full-ride package including comprehensive tuition waivers and personal maintenance allowance."}
                           </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Structured Eligibility */}
                        <div className="space-y-5">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Icons.Status /> Eligibility Matrix
                          </h5>
                          <div className="space-y-3">
                            {(s.eligibility || ["High academic standing", "Financial need", "Demonstrated leadership"]).map((item, idx) => (
                              <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 items-start">
                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 shrink-0" />
                                <span className="text-xs font-bold text-slate-700 leading-tight">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Document Requirements */}
                        <div className="space-y-5">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Icons.FileText /> Submission Dossier
                          </h5>
                          <div className="space-y-3">
                            {(s.essayRequirements || ["Personal statement", "Letter of recommendation", "Transcripts"]).map((item, idx) => (
                              <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 items-start">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                                <span className="text-xs font-bold text-slate-700 leading-tight">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* AI Win Strategy Section */}
                      {advice[s.id] ? (
                        <div className="p-8 bg-indigo-900 rounded-[3rem] text-white relative overflow-hidden group/advice shadow-2xl">
                          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover/advice:scale-110 transition-transform duration-700">
                             <Icons.Sparkles />
                          </div>
                          <p className="font-black text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                            AI Win Strategy Lab ✨
                          </p>
                          <div className="text-sm font-medium text-indigo-50 leading-relaxed italic prose prose-invert">
                            "{advice[s.id]}"
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => getAdvice(s)}
                          disabled={loading[s.id]}
                          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 border border-slate-800 shadow-xl"
                        >
                          {loading[s.id] ? (
                            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Icons.Sparkles />
                              Analyze Successful Profile Markers
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : !isDeepScanning && searchQuery.trim() && (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-24 space-y-6 max-w-md mx-auto">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 border-4 border-dashed border-slate-200">
              <Icons.Cash />
            </div>
            <h4 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">No results</h4>
            <p className="text-slate-500 font-bold leading-relaxed">
              We couldn't find funding matching "{searchQuery}". Run an AI discovery scan to find real-time grants directly from university and government portals.
            </p>
            <button 
              onClick={handleDeepScan}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 mx-auto active:scale-95"
            >
               <Icons.Sparkles /> Run Deep Discovery Scan
            </button>
          </div>
        )}
      </div>

      {/* Footer Policy */}
      <div className="p-10 bg-indigo-50/50 rounded-[3rem] border border-indigo-100/50 text-center space-y-4">
        <h4 className="text-lg font-black text-indigo-900 uppercase tracking-tighter">Scholarship Trust Policy</h4>
        <p className="text-xs text-indigo-700 font-bold max-w-2xl mx-auto leading-relaxed">
          Unipath uses real-time web grounding to discover funding. Discovered scholarships are verified against institutional domains to ensure authenticity. Always verify final deadlines on the official provider portal.
        </p>
      </div>
    </div>
  );
};

export default Scholarships;