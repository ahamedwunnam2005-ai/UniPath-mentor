
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AppTab, UserProfile, AppNotification } from '../types';
import { Icons } from '../constants';
import { SyncStatus } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  user: UserProfile;
  syncStatus: SyncStatus;
  lastSaved?: Date | null;
  onUpdateUser: (user: UserProfile) => void;
  notifications: AppNotification[];
  onNotificationClick: (id: string) => void;
  onMarkAllRead: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  user, 
  syncStatus,
  lastSaved,
  onUpdateUser,
  notifications,
  onNotificationClick,
  onMarkAllRead,
  onLogout
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: AppTab.DASHBOARD, label: 'Roadmap', Icon: Icons.Dashboard },
    { id: AppTab.STATUS, label: 'Tracker', Icon: Icons.Status },
    { id: AppTab.UNI_FINDER, label: 'Discovery', Icon: Icons.Globe },
    { id: AppTab.SMART_MATCH, label: 'Smart Match', Icon: Icons.Sparkles },
    { id: AppTab.SCHOLARSHIPS, label: 'Funding', Icon: Icons.Cash },
    { id: AppTab.DOCUMENT_MENTOR, label: 'Essays', Icon: Icons.FileText },
    { id: AppTab.PEER_MENTOR, label: 'Mentors', Icon: Icons.Users },
    { id: AppTab.ELITE_NETWORK, label: 'Elite Network', Icon: Icons.Network },
    { id: AppTab.AI_CHAT, label: 'Chat', Icon: Icons.Message },
    { id: AppTab.PROFILE, label: 'Profile', Icon: Icons.Profile },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const profileStrength = useMemo(() => {
    let score = 0;
    if (user.name) score += 20;
    if (user.country) score += 10;
    if (user.gpa) score += 20;
    if (user.satScore) score += 10;
    if (user.targetMajor) score += 10;
    if (user.bio) score += 10;
    if (user.avatarUrl) score += 10;
    if (user.testScores?.toefl || user.testScores?.det) score += 10;
    return score;
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = (n: AppNotification) => {
    onNotificationClick(n.id);
    setIsNotifOpen(false);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen-safe bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col z-20 shadow-[8px_0_30px_rgba(0,0,0,0.02)]">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
            U
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            UniPath<span className="text-indigo-600">.</span>
          </h1>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`transition-colors ${activeTab === id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                <Icon />
              </div>
              <span className="font-bold text-xs uppercase tracking-widest truncate">{label}</span>
              {activeTab === id && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0" />}
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-3 border-t border-slate-100 bg-slate-50/50">
          <div className="px-2">
            <div className="flex justify-between items-center mb-1.5">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Profile Strength</span>
               <span className="text-[8px] font-black text-indigo-600">{profileStrength}%</span>
            </div>
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                 style={{ width: `${profileStrength}%` }} 
               />
            </div>
          </div>
          
          <button 
            onClick={() => setActiveTab(AppTab.PROFILE)}
            className="w-full bg-slate-900 p-4 rounded-2xl text-white relative overflow-hidden group cursor-pointer shadow-xl text-left hover:scale-[1.02] transition-all"
          >
            <div className="relative z-10">
              <p className="text-[9px] font-black text-indigo-400 mb-1 uppercase tracking-widest">Active Identity</p>
              <p className="text-xs font-bold text-white leading-tight truncate">{user.name || "Set Identification"}</p>
            </div>
            <div className="absolute top-0 right-0 p-3 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
               <Icons.Profile />
            </div>
          </button>

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-hidden">
        {/* Universal Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">U</div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tighter">UniPath</h2>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <h2 className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                System Status: 
              </h2>
              {syncStatus === 'syncing' ? (
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  Syncing to Cloud...
                </span>
              ) : syncStatus === 'saved' ? (
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  All Changes Permanent
                </span>
              ) : syncStatus === 'error' ? (
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  Sync Failure
                </span>
              ) : (
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 opacity-50">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                  Live & Synchronized
                </span>
              )}
            </div>
            {lastSaved && (
              <span className="hidden lg:block text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                Last Save: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-100 shadow-sm">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                Network Latency: 42ms
             </div>

             {/* Notification Center */}
             <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                >
                  <Icons.Bell />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Admissions Feed</h3>
                      <button 
                        onClick={onMarkAllRead}
                        className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className={`w-full text-left p-5 flex gap-4 hover:bg-slate-50 transition-colors border-b border-slate-50 group ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                          >
                            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                              n.type === 'deadline' ? 'bg-rose-50 text-rose-600' :
                              n.type === 'feedback' ? 'bg-green-50 text-green-600' :
                              n.type === 'message' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {n.type === 'deadline' ? <Icons.Sparkles /> : 
                               n.type === 'feedback' ? <Icons.FileText /> : 
                               n.type === 'message' ? <Icons.Message /> : <Icons.Globe />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tighter">{n.title}</p>
                                {!n.isRead && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                              </div>
                              <p className="text-[11px] text-slate-500 font-bold leading-relaxed line-clamp-2">{n.message}</p>
                              <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-tighter">
                                {getTimeAgo(n.timestamp)}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-10 text-center">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Icons.Bell />
                          </div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zero Alerts</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
             </div>

             <button 
              onClick={() => setActiveTab(AppTab.PROFILE)}
              className="flex items-center gap-2 hover:bg-slate-100 p-1 rounded-full transition-colors"
             >
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-800 leading-none">{user.name || "Scholar"}</p>
                  <p className="text-[8px] font-black text-green-600 uppercase tracking-tighter">Verified</p>
                </div>
                <div className="h-8 w-8 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 shadow-sm flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 scale-75">
                      <Icons.Profile />
                    </div>
                  )}
                </div>
             </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-28 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center z-50 h-20 px-2 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.08)] overflow-x-auto no-scrollbar">
        {navItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center px-3 py-1 min-w-[64px] transition-all relative ${
              activeTab === id ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <div className={`${activeTab === id ? 'scale-110' : 'scale-100'} transition-transform`}><Icon /></div>
            <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter whitespace-nowrap">{label}</span>
            {activeTab === id && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center px-3 py-1 min-w-[64px] text-rose-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
          <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter whitespace-nowrap">Exit</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
