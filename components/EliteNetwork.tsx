
import React, { useState } from 'react';
import { MOCK_NETWORKS, Icons } from '../constants';
import { geminiService } from '../services/geminiService';
import { Network, UserProfile } from '../types';

interface EliteNetworkProps {
  user: UserProfile;
}

const EliteNetwork: React.FC<EliteNetworkProps> = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Professional' | 'Student' | 'Alumni'>('All');
  const [advice, setAdvice] = useState<{ [id: string]: string }>({});
  const [loadingAdvice, setLoadingAdvice] = useState<{ [id: string]: boolean }>({});
  const [showHubDetail, setShowHubDetail] = useState<string | null>(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [regStep, setRegStep] = useState(1);

  const filtered = MOCK_NETWORKS.filter(n => 
    selectedCategory === 'All' || n.category === selectedCategory
  );

  const handleDownloadGuide = () => {
    const guideContent = `
============================================================
UNIPATH MENTOR: THE ULTIMATE ADMISSIONS GUIDE 2026
============================================================
A Comprehensive Roadmap for International Students applying 
to European and North American Institutions.

PHASE 1: RESEARCH & DISCOVERY (May - July)
------------------------------------------------------------
- Identify 10-12 schools (2 Reach, 6 Target, 2 Safety).
- Check specific "Need-Blind" vs "Need-Aware" policies for your country.
- Use UniPath Smart Match to align GPA and Test Scores.

PHASE 2: STANDARDIZED TESTING (June - September)
------------------------------------------------------------
- SAT/ACT: Target 1500+ for Ivies; 1400+ for Tier-1 Publics.
- English Proficiency: Duolingo (125+), TOEFL (100+), or IELTS (7.5+).
- Request fee waivers via EducationUSA if applicable.

PHASE 3: THE ESSAY LAB (August - October)
------------------------------------------------------------
- Personal Statement: Focus on your "Unique Core". How does your 
  background in ${user.country || 'your home country'} solve global problems?
- Supplemental Essays: Research each school's specific values 
  (e.g., Yale's curiosity, Stanford's innovation).

PHASE 4: FINANCIAL AID (October - November)
------------------------------------------------------------
- Complete CSS Profile for private US universities.
- Submit ISFAA or school-specific forms for international students.
- Finalize Scholarship applications (Mastercard Foundation, Gates, etc).

PHASE 5: FINAL SUBMISSION (December - January)
------------------------------------------------------------
- Double check all transcripts and letters of recommendation.
- Submit via Common App or Coalition App.

PHASE 6: VISA & RELOCATION (March - August)
------------------------------------------------------------
- Receive I-20 or CAS from your institution.
- Pay SEVIS fee ($350) and schedule F-1/Student Visa interview.
- Connect with your local ASA (African Students Association).

============================================================
Generated personally for: ${user.name || 'Aspiring Scholar'}
Date: ${new Date().toLocaleDateString()}
UniPath Mentor v2.0 - Empowering the Global Diaspora.
============================================================
    `;
    const blob = new Blob([guideContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UniPath_Admissions_Guide_2026.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getReferralAdvice = async (network: Network) => {
    if (advice[network.id]) return;
    setLoadingAdvice(prev => ({ ...prev, [network.id]: true }));
    try {
      const res = await geminiService.getNetworkAdvice(network.name, user.targetMajor);
      setAdvice(prev => ({ ...prev, [network.id]: res }));
    } catch (err) {
      console.error(err);
      setAdvice(prev => ({ ...prev, [network.id]: "Unable to fetch advice. Try again later." }));
    } finally {
      setLoadingAdvice(prev => ({ ...prev, [network.id]: false }));
    }
  };

  const hubResources = [
    { id: 'h1', title: 'ASA Global Directory', desc: 'Find African Student Associations at 500+ US/Canada colleges.', icon: <Icons.Globe />, color: 'bg-blue-50 text-blue-600' },
    { id: 'h2', title: 'F-1 Legal Aid Hub', desc: 'Pro-bono legal resources for visa status and work authorization.', icon: <Icons.Status />, color: 'bg-green-50 text-green-600' },
    { id: 'h3', title: 'Diaspora Wellness', desc: 'Culturally-sensitive mental health resources for African students.', icon: <Icons.Sparkles />, color: 'bg-rose-50 text-rose-600' },
    { id: 'h4', title: 'Relocation Toolbox', desc: 'Checklists for housing, banking, and mobile plans in North America.', icon: <Icons.Dashboard />, color: 'bg-amber-50 text-amber-600' },
  ];

  const getIcon = (type: string) => {
    switch(type) {
      case 'tech': return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
      case 'law': return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      );
      case 'business': return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
      default: return <Icons.Users />;
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Network Hero */}
      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">Your Diaspora Bridge.</h2>
          <p className="text-slate-300 font-bold text-sm md:text-base leading-relaxed opacity-90 mb-8">
            Access curated, high-impact networks that empower African students in North America. These organizations provide public resources, advocacy, and a community of peers.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setShowRegForm(true)}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3"
            >
              <Icons.Users />
              Register as Mentor
            </button>
            <button 
              onClick={handleDownloadGuide}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3"
            >
              <Icons.Cash />
              Download Guide (.txt)
            </button>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none scale-150 text-indigo-500">
           <Icons.Network />
        </div>
      </div>

      {/* Cultural & Support Hub */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Cultural & Support Hub</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Essential resources for the diaspora</p>
          </div>
          <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">View All Hubs</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hubResources.map(res => (
            <button 
              key={res.id}
              onClick={() => setShowHubDetail(res.id)}
              className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm text-left hover:border-indigo-400 hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className={`w-10 h-10 ${res.color} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                {res.icon}
              </div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">{res.title}</h4>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{res.desc}</p>
              
              <div className="mt-4 flex items-center gap-1.5 text-indigo-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                View Resource <Icons.ChevronRight />
              </div>

              {showHubDetail === res.id && (
                <div className="absolute inset-0 bg-indigo-900 text-white p-6 flex flex-col justify-center animate-in fade-in zoom-in duration-300 z-10">
                  <h4 className="text-sm font-black uppercase mb-2">{res.title}</h4>
                  <p className="text-[10px] opacity-90 leading-relaxed mb-4">Accessing secure external resource portal. You will be redirected shortly.</p>
                  <button onClick={(e) => { e.stopPropagation(); setShowHubDetail(null); }} className="text-[10px] font-black uppercase underline">Back to Hub</button>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Categories Filter */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Professional Directories</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by network focus</p>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {(['All', 'Professional', 'Student', 'Alumni'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  selectedCategory === cat 
                  ? 'bg-indigo-900 text-white border-indigo-900 shadow-xl' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Networks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map(network => (
            <div key={network.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-900 group-hover:text-white transition-all duration-500 shadow-sm">
                  {getIcon(network.iconType)}
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {network.category}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2 group-hover:text-indigo-600 transition-colors">
                {network.name}
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {network.focus.map(f => (
                  <span key={f} className="text-[10px] font-bold text-slate-400">#{f}</span>
                ))}
              </div>

              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 flex-1">
                {network.description}
              </p>

              <div className="space-y-4">
                {advice[network.id] ? (
                  <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] text-xs text-indigo-900 italic animate-in slide-in-from-top-4">
                    <p className="font-black text-indigo-600 mb-2 uppercase tracking-widest text-[10px]">AI Connector Insight ✨</p>
                    <p className="leading-relaxed">"{advice[network.id]}"</p>
                  </div>
                ) : (
                  <button
                    onClick={() => getReferralAdvice(network)}
                    disabled={loadingAdvice[network.id]}
                    className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-3"
                  >
                    {loadingAdvice[network.id] ? (
                      <div className="w-4 h-4 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Icons.Sparkles />
                        Get Outreach Strategy
                      </>
                    )}
                  </button>
                )}

                <a
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  Access Public Portal
                  <Icons.ChevronRight />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Mentor Registration</h3>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${regStep >= i ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                    ))}
                  </div>
                </div>
                <button onClick={() => { setShowRegForm(false); setRegStep(1); }} className="p-3 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-all">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {regStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current University</label>
                    <input type="text" placeholder="e.g. Harvard University" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Major / Degree</label>
                    <input type="text" placeholder="e.g. B.Sc Biomedical Engineering" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                  </div>
                  <button onClick={() => setRegStep(2)} className="w-full py-5 bg-indigo-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-800 transition-all">Continue to Credentials</button>
                </div>
              )}

              {regStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scholarship (If any)</label>
                    <input type="text" placeholder="e.g. Mastercard Foundation Scholar" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LinkedIn Profile URL</label>
                    <input type="url" placeholder="https://linkedin.com/in/..." className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold" />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setRegStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest">Back</button>
                    <button onClick={() => setRegStep(3)} className="flex-2 py-5 bg-indigo-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-800 transition-all px-12">Final Step</button>
                  </div>
                </div>
              )}

              {regStep === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-8 text-center">
                  <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-green-100">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 uppercase">Verification Submitted</h4>
                    <p className="text-sm font-bold text-slate-500 mt-2 leading-relaxed">
                      Our admissions team will review your LinkedIn and University credentials. You'll receive an email within 48 hours with your Mentor Access Key.
                    </p>
                  </div>
                  <button onClick={() => { setShowRegForm(false); setRegStep(1); }} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Close & Return</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-10 bg-indigo-50 rounded-[3rem] border border-indigo-100/50 text-center space-y-4">
        <h4 className="text-lg font-black text-indigo-900 uppercase tracking-tighter">Network Expansion Policy</h4>
        <p className="text-xs text-indigo-700 font-bold max-w-2xl mx-auto leading-relaxed">
          UniPath maintains a strictly curated list of open-access professional networks. We prioritize organizations with proven track records of advocating for and supporting international students from the African continent. No private member data is stored or accessed.
        </p>
      </div>
    </div>
  );
};

export default EliteNetwork;
