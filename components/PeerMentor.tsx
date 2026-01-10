
import React, { useState, useMemo } from 'react';
import { MOCK_MENTORS, Icons } from '../constants';
import { Mentor } from '../types';
import MentorChat from './MentorChat';

const PeerMentor: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeMentor, setActiveMentor] = useState<Mentor | null>(null);
  const [chatInitialMode, setChatInitialMode] = useState<'text' | 'voice'>('text');
  const [filters, setFilters] = useState({
    university: 'All Universities',
    major: 'All Majors',
    origin: 'All Countries',
    scholarship: 'All Statuses'
  });

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const universities = Array.from(new Set(MOCK_MENTORS.map(m => m.university)));
    const majors = Array.from(new Set(MOCK_MENTORS.map(m => m.major)));
    const countries = Array.from(new Set(MOCK_MENTORS.map(m => m.origin)));
    const scholarships = Array.from(new Set(MOCK_MENTORS.map(m => m.scholarship).filter(Boolean)));
    
    return {
      universities: ['All Universities', ...universities],
      majors: ['All Majors', ...majors],
      countries: ['All Countries', ...countries],
      scholarships: ['All Statuses', 'Scholarship Winners', ...scholarships as string[]]
    };
  }, []);

  const filteredMentors = MOCK_MENTORS.filter(mentor => {
    const matchesSearch = 
      mentor.name.toLowerCase().includes(search.toLowerCase()) ||
      mentor.university.toLowerCase().includes(search.toLowerCase()) ||
      mentor.major.toLowerCase().includes(search.toLowerCase()) ||
      mentor.origin.toLowerCase().includes(search.toLowerCase());

    const matchesUni = filters.university === 'All Universities' || mentor.university === filters.university;
    const matchesMajor = filters.major === 'All Majors' || mentor.major === filters.major;
    const matchesOrigin = filters.origin === 'All Countries' || mentor.origin === filters.origin;
    
    let matchesScholarship = true;
    if (filters.scholarship === 'Scholarship Winners') {
      matchesScholarship = !!mentor.scholarship;
    } else if (filters.scholarship !== 'All Statuses') {
      matchesScholarship = mentor.scholarship === filters.scholarship;
    }

    return matchesSearch && matchesUni && matchesMajor && matchesOrigin && matchesScholarship;
  });

  const openChat = (mentor: Mentor, mode: 'text' | 'voice') => {
    setChatInitialMode(mode);
    setActiveMentor(mentor);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="bg-indigo-900 rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl border border-indigo-950">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg"><Icons.Users /></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Live Mentorship Hub</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-none">Learn from those <br />who made it.</h2>
          <p className="text-indigo-100 font-bold text-sm md:text-base leading-relaxed opacity-80 mb-8 max-w-lg">
            Connect with verified mentors from across the continent who are currently studying at top US institutions. Launch a **Live Call** for instant advice on essays and interviews.
          </p>
          <div className="flex items-center gap-6">
             <div className="flex -space-x-3">
                {MOCK_MENTORS.slice(0, 4).map(m => (
                  <div key={m.id} className="w-10 h-10 rounded-full border-2 border-indigo-900 overflow-hidden shadow-xl">
                    <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                ))}
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">500+ Peer Mentors Online</p>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 opacity-10 pointer-events-none scale-150 text-indigo-400 rotate-12">
           <Icons.Users />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search mentors by name, university, or major..."
            className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white font-bold text-slate-700 transition-all outline-none shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute left-5 top-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(['university', 'major', 'origin', 'scholarship'] as const).map(key => (
            <div key={key} className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">{key.replace('_', ' ')}</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-slate-600 focus:ring-2 focus:ring-indigo-600 transition-all cursor-pointer appearance-none shadow-sm"
                value={filters[key]}
                onChange={(e) => setFilters({...filters, [key]: e.target.value})}
              >
                {filterOptions[key === 'university' ? 'universities' : key === 'origin' ? 'countries' : (key + 's') as any].map((u: string) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
        {filteredMentors.length > 0 ? (
          filteredMentors.map(mentor => (
            <div key={mentor.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all group flex flex-col h-full animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-5 mb-8">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-slate-50 group-hover:border-indigo-100 transition-all shadow-xl">
                     <img src={mentor.imageUrl} alt={mentor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors">{mentor.name}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">
                     <Icons.Globe /> {mentor.origin}
                  </div>
                </div>
              </div>

              <div className="space-y-5 mb-10 flex-1">
                <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-all">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500">Academic Standing</p>
                   <p className="text-sm font-black text-slate-800 leading-tight">{mentor.university}</p>
                   <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{mentor.major}</p>
                </div>
                {mentor.scholarship && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 w-fit">
                     <Icons.Star className="w-3.5 h-3.5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{mentor.scholarship} Scholar</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => openChat(mentor, 'text')}
                  className="py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Icons.Message /> Chat
                </button>
                <button 
                  onClick={() => openChat(mentor, 'voice')}
                  className="py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 3 3 3 0 01-3-3V5a3 3 0 013-3z" /></svg>
                  Call
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-32 space-y-6">
            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-4 border-4 border-dashed border-slate-200">
              <Icons.Users />
            </div>
            <h4 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">No mentors found</h4>
            <p className="text-slate-500 font-bold max-w-sm text-sm leading-relaxed">
              We couldn't find any mentors matching your criteria. Try loosening your filters or searching for specific majors.
            </p>
          </div>
        )}
      </div>

      {activeMentor && (
        <MentorChat 
          mentor={activeMentor} 
          onClose={() => setActiveMentor(null)} 
          initialMode={chatInitialMode}
        />
      )}

      {/* Bottom Engagement Banner */}
      <div className="p-12 bg-indigo-900 rounded-[4rem] text-white text-center space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none scale-150"><Icons.Sparkles /></div>
        <div className="relative z-10">
          <h4 className="text-3xl font-black uppercase tracking-tighter leading-none mb-4">Are you a scholar abroad?</h4>
          <p className="text-indigo-200 font-bold text-sm max-w-xl mx-auto leading-relaxed">
            Join our verified mentor network and help the next generation of global scholars achieve their dreams. Mentors get exclusive access to professional networking and alumni circles.
          </p>
          <button className="mt-8 px-12 py-5 bg-white text-indigo-900 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all shadow-2xl active:scale-95">
             Apply to Join the Elite Network
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeerMentor;
