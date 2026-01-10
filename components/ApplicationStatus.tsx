
import React, { useState } from 'react';
import { Application, ApplicationState, University } from '../types';
import { Icons } from '../constants';

interface ApplicationStatusProps {
  applications: Application[];
  universities: University[];
  onUpdateStatus: (id: string, status: ApplicationState) => void;
  onRemove: (id: string) => void;
  onExplore: () => void;
}

const STATUSES: ApplicationState[] = ['Draft', 'Submitted', 'Under Review', 'Interviewing', 'Accepted', 'Waitlisted', 'Rejected'];

const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ applications, universities, onUpdateStatus, onRemove, onExplore }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const getStatusColor = (status: ApplicationState) => {
    switch (status) {
      case 'Accepted': return 'bg-green-50 text-green-600 border-green-200';
      case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Submitted': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Interviewing': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Waitlisted': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const stats = {
    total: applications.length,
    accepted: applications.filter(a => a.status === 'Accepted').length,
    pending: applications.filter(a => !['Accepted', 'Rejected', 'Draft'].includes(a.status)).length,
  };

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 border-4 border-dashed border-indigo-100">
          <Icons.Status />
        </div>
        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">No active applications</h3>
        <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed mb-10">
          Your application tracker is empty. To start tracking your progress, find a university in the discovery engine and add it to your list.
        </p>
        <button 
          onClick={onExplore}
          className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95"
        >
          <Icons.Globe />
          Explore Universities
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
            {stats.total}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Apps</p>
            <p className="text-sm font-bold text-slate-800">Your Managed List</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-black">
            {stats.accepted}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accepted</p>
            <p className="text-sm font-bold text-slate-800">Current Offers</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black">
            {stats.pending}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Progress</p>
            <p className="text-sm font-bold text-slate-800">Awaiting Decision</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
             <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
             Active Application Records
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
             <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Synced with Profile</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {applications.map((app) => {
            const uni = universities.find(u => u.id === app.universityId);
            if (!uni) return null;
            
            return (
              <div key={app.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-slate-50/50 transition-colors">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-md border border-slate-100 shrink-0">
                  <img src={uni.imageUrl} alt={uni.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{uni.country} • Rank #{uni.rank}</p>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">{uni.name}</h4>
                  <div className="flex flex-wrap gap-2">
                     {uni.tags.slice(0, 2).map(t => (
                       <span key={t} className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">{t}</span>
                     ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-auto text-center sm:text-right">
                     {editingId === app.id ? (
                       <div className="flex flex-col gap-2">
                         <select 
                          autoFocus
                          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm"
                          value={app.status}
                          onChange={(e) => {
                            onUpdateStatus(app.id, e.target.value as ApplicationState);
                            setEditingId(null);
                          }}
                          onBlur={() => setEditingId(null)}
                         >
                           {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Update status</p>
                       </div>
                     ) : (
                       <div className="space-y-2">
                          <span className={`px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest inline-block ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Update: {new Date().toLocaleDateString()}</p>
                       </div>
                     )}
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setEditingId(editingId === app.id ? null : app.id)}
                      className="flex-1 sm:flex-none p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                      title="Edit Status"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button 
                      onClick={() => onRemove(app.id)}
                      className="flex-1 sm:flex-none p-3 bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 rounded-xl transition-all shadow-sm"
                      title="Remove Record"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;
