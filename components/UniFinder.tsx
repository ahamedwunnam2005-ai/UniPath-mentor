
import React, { useState, useMemo } from 'react';
import { University } from '../types';
import { MOCK_UNIVERSITIES, Icons } from '../constants';
import { geminiService } from '../services/geminiService';

interface UniFinderProps {
  onTrack: (uni: University) => void;
  trackingIds: string[];
}

const UniFinder: React.FC<UniFinderProps> = ({ onTrack, trackingIds }) => {
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'Europe' | 'North America'>('All');
  const [search, setSearch] = useState('');
  const [insight, setInsight] = useState<{ [id: string]: string }>({});
  const [loadingInsight, setLoadingInsight] = useState<{ [id: string]: boolean }>({});
  const [webResults, setWebResults] = useState<string | null>(null);
  const [webSources, setWebSources] = useState<{ uri: string, title: string }[]>([]);
  const [externalResults, setExternalResults] = useState<University[]>([]);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [isFetchingExternal, setIsFetchingExternal] = useState(false);

  // Advanced Sorting Logic: Strict prioritization based on match quality
  const sortedUniversities = useMemo(() => {
    const s = search.trim().toLowerCase();
    
    // Filter first (Inclusion match)
    const localFiltered = MOCK_UNIVERSITIES.filter(u => {
      const matchesRegion = selectedRegion === 'All' || u.region === selectedRegion;
      const matchesSearch = !s || 
                            u.name.toLowerCase().includes(s) || 
                            u.country.toLowerCase().includes(s) ||
                            u.location.toLowerCase().includes(s) ||
                            u.tags.some(t => t.toLowerCase().includes(s));
      return matchesRegion && matchesSearch;
    });

    const all = [...localFiltered, ...externalResults];
    
    if (!s) return all;

    return [...all].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aCountry = a.country.toLowerCase();
      const bCountry = b.country.toLowerCase();
      const aLoc = a.location.toLowerCase();
      const bLoc = b.location.toLowerCase();

      // 1. Exact Name Match Priority
      const aExactName = aName === s;
      const bExactName = bName === s;
      if (aExactName !== bExactName) return aExactName ? -1 : 1;

      // 2. Name Starts With Priority
      const aStartsName = aName.startsWith(s);
      const bStartsName = bName.startsWith(s);
      if (aStartsName !== bStartsName) return aStartsName ? -1 : 1;

      // 3. Location/Country Exact Match
      const aExactPlace = aCountry === s || aLoc === s;
      const bExactPlace = bCountry === s || bLoc === s;
      if (aExactPlace !== bExactPlace) return aExactPlace ? -1 : 1;

      // 4. Location/Country Starts With
      const aStartsPlace = aCountry.startsWith(s) || aLoc.startsWith(s);
      const bStartsPlace = bCountry.startsWith(s) || bLoc.startsWith(s);
      if (aStartsPlace !== bStartsPlace) return aStartsPlace ? -1 : 1;
      
      // 5. Fallback to Rank
      if (a.rank !== b.rank) return a.rank - b.rank;

      // Final Tie-breaker
      return aName.localeCompare(bName);
    });
  }, [search, selectedRegion, externalResults]);

  // Identify the "Top Result" if search exists
  const topMatch = search.trim() && sortedUniversities.length > 0 ? sortedUniversities[0] : null;
  const remainingUniversities = topMatch ? sortedUniversities.slice(1) : sortedUniversities;

  // Optimized Deep Scan: Uses cached results and parallel execution
  const handleDeepScan = async () => {
    if (!search.trim()) return;
    setIsSearchingWeb(true);
    setIsFetchingExternal(true);
    
    try {
      // Parallel execution for speed
      const [webInfo, liveUnis] = await Promise.all([
        geminiService.searchUniversitiesWeb(search),
        geminiService.fetchExternalUniversities(search)
      ]);

      setWebResults(webInfo.text);
      setWebSources(webInfo.sources);
      
      setExternalResults(prev => {
        // Prevent duplicates from mock data AND previous external fetches
        const mockNames = new Set(MOCK_UNIVERSITIES.map(m => m.name.toLowerCase()));
        const existingExternalNames = new Set(prev.map(p => p.name.toLowerCase()));
        
        const newResults = liveUnis.filter((f: any) => {
          const lowName = f.name.toLowerCase();
          return !mockNames.has(lowName) && !existingExternalNames.has(lowName);
        });
        
        return [...prev, ...newResults];
      });
    } catch (err) {
      console.error(err);
      setWebResults("Deep scan currently unavailable.");
    } finally {
      setIsSearchingWeb(false);
      setIsFetchingExternal(false);
    }
  };

  const getInsights = async (uni: any) => {
    if (insight[uni.id]) return;
    setLoadingInsight(prev => ({ ...prev, [uni.id]: true }));
    try {
      const res = await geminiService.getUniversityInsights(uni.name, uni.region);
      setInsight(prev => ({ ...prev, [uni.id]: res }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsight(prev => ({ ...prev, [uni.id]: false }));
    }
  };

  const LogoPlaceholder = ({ name }: { name: string }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['bg-indigo-600', 'bg-slate-900', 'bg-emerald-600', 'bg-rose-600', 'bg-blue-600', 'bg-amber-600'];
    const color = colors[name.length % colors.length];
    return (
      <div className={`w-full h-full flex items-center justify-center text-white font-black text-xl tracking-tighter ${color}`}>
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Intelligent Search Section */}
      <div className="bg-white p-4 md:p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search local or scan the web..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 transition-all text-sm md:text-base font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDeepScan()}
              />
              <div className="absolute left-4 top-4 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button 
              onClick={handleDeepScan}
              disabled={isSearchingWeb || !search.trim()}
              className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSearchingWeb ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Icons.Sparkles /> AI Deep Scan</>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {['All', 'Europe', 'North America'].map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r as any)}
              className={`px-4 py-1.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all shrink-0 border ${
                selectedRegion === r ? 'bg-indigo-900 border-indigo-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Feed */}
      <div className="space-y-12">
        {/* TOP MATCH FEATURED SECTION */}
        {topMatch && (
          <div className="space-y-6">
             <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-indigo-600 uppercase tracking-tighter flex items-center gap-2">
                <Icons.Sparkles /> Top Discovery
              </h3>
              <div className="h-px flex-1 bg-indigo-100" />
            </div>

            <div className="bg-indigo-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative group border border-indigo-950">
              <div className="lg:w-1/2 relative h-64 lg:h-auto overflow-hidden">
                <img 
                  src={topMatch.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?auto=format&fit=crop&q=80&w=800'} 
                  alt={topMatch.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-transparent to-transparent hidden lg:block" />
                
                {/* Logo Badge for Top Match */}
                <div className="absolute top-8 left-8 z-20 w-20 h-20 bg-white p-3 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  {topMatch.logoUrl ? (
                    <img src={topMatch.logoUrl} alt={`${topMatch.name} logo`} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <LogoPlaceholder name={topMatch.name} />
                  )}
                </div>
              </div>
              
              <div className="p-8 lg:p-12 lg:w-1/2 flex flex-col justify-center text-white relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-xl text-[10px] font-black uppercase border border-white/10">
                    Rank #{topMatch.rank}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                    {topMatch.country}
                  </span>
                </div>
                
                <h3 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter leading-none group-hover:translate-x-2 transition-transform duration-500">
                  {topMatch.name}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {topMatch.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase border border-white/5 tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={topMatch.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-4 bg-white text-indigo-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all text-center shadow-xl"
                  >
                    Go to Portal
                  </a>
                  <button 
                    onClick={() => onTrack(topMatch)}
                    disabled={trackingIds.includes(topMatch.id)}
                    className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${
                      trackingIds.includes(topMatch.id) 
                      ? 'bg-emerald-500 text-white shadow-emerald-900/20' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/40'
                    }`}
                  >
                    {trackingIds.includes(topMatch.id) ? 'Application Tracked' : 'Mark as Applied'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OTHER MATCHES GRID */}
        {remainingUniversities.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Verified Matches</h3>
              <div className="h-px flex-1 bg-slate-200" />
              {isFetchingExternal && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse border border-indigo-100">
                  Polling Web...
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingUniversities.map(uni => {
                const isTracked = trackingIds.includes(uni.id);
                return (
                  <div 
                    key={uni.id} 
                    className={`bg-white rounded-[2.5rem] overflow-hidden border transition-all duration-500 group flex flex-col relative ${
                      uni.isExternal 
                        ? 'border-indigo-100 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100/50' 
                        : 'border-slate-200 hover:border-indigo-600 hover:shadow-xl'
                    }`}
                  >
                    {uni.isExternal && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                          <Icons.Sparkles />
                          Live result
                        </div>
                      </div>
                    )}
                    
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={uni.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?auto=format&fit=crop&q=80&w=800'} 
                        alt={uni.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      
                      {/* Floating Logo Badge */}
                      <div className="absolute top-4 left-4 z-10 w-12 h-12 bg-white p-1.5 rounded-xl shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-slate-100 overflow-hidden">
                        {uni.logoUrl ? (
                          <img 
                            src={uni.logoUrl} 
                            alt={`${uni.name} logo`} 
                            className="w-full h-full object-contain" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-indigo-900 text-white text-[10px] font-black uppercase tracking-tighter">${uni.name.substring(0,2).toUpperCase()}</div>`;
                            }}
                          />
                        ) : (
                          <LogoPlaceholder name={uni.name} />
                        )}
                      </div>

                      <div className="absolute bottom-4 right-4">
                        <span className="px-3 py-1.5 bg-white/95 backdrop-blur rounded-xl text-[10px] font-black text-slate-900 shadow-xl uppercase border border-slate-100">
                          Rank #{uni.rank}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-7 flex-1 flex flex-col">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">
                          <Icons.Globe /> {uni.country}
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">{uni.name}</h3>
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {uni.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase border border-slate-100 tracking-tighter">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-6 border-t border-slate-50 space-y-3">
                        {insight[uni.id] ? (
                          <div className="bg-indigo-50/50 p-5 rounded-2xl text-xs text-indigo-900 italic animate-in fade-in slide-in-from-top-2 border border-indigo-100">
                            <p className="font-black mb-2 text-indigo-700 not-italic uppercase tracking-widest text-[9px]">AI Intelligence ✨</p>
                            <p className="leading-relaxed">"{insight[uni.id]}"</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => getInsights(uni)}
                            disabled={loadingInsight[uni.id]}
                            className="w-full py-3.5 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 border border-indigo-100"
                          >
                            {loadingInsight[uni.id] ? (
                              <div className="w-4 h-4 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <><Icons.Sparkles /> Get Insider Insight</>
                            )}
                          </button>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <a 
                            href={uni.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3.5 border border-indigo-600 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-center"
                          >
                             Official Site
                          </a>
                          <button 
                            onClick={() => onTrack(uni)}
                            disabled={isTracked}
                            className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                              isTracked 
                              ? 'bg-emerald-500 text-white shadow-emerald-100 cursor-default' 
                              : 'bg-slate-900 text-white hover:bg-indigo-600'
                            }`}
                          >
                            {isTracked ? (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Tracked
                              </>
                            ) : (
                              'Mark Applied'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : !isFetchingExternal && search.trim() && (
          <div className="py-24 text-center space-y-6 max-w-md mx-auto">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-4 border-dashed border-slate-200">
              <Icons.Globe />
            </div>
            <h4 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">No results</h4>
            <p className="text-slate-500 font-bold leading-relaxed">
              We couldn't find matches for "{search}". Run an AI Deep Scan to find accurate information directly from the web.
            </p>
            <button 
              onClick={handleDeepScan}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 mx-auto active:scale-95"
            >
               <Icons.Sparkles /> AI Deep Scan Web
            </button>
          </div>
        )}

        {webResults && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-indigo-600 uppercase tracking-tighter">Admissions Intelligence Hub</h3>
              <div className="h-px flex-1 bg-indigo-100" />
            </div>
            
            <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-150 transition-transform duration-700">
                 <Icons.Sparkles />
              </div>
              <div className="prose prose-invert max-w-none text-indigo-100 leading-relaxed whitespace-pre-wrap font-serif text-sm md:text-base mb-10 opacity-90">
                {webResults}
              </div>

              {webSources.length > 0 && (
                <div className="pt-8 border-t border-white/10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-5">Verified Sources (Gemini Grounding)</p>
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
      </div>
    </div>
  );
};

export default UniFinder;
