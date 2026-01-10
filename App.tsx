
import React, { useState, useEffect } from 'react';
import { AppTab, ApplicationStep, University, UserProfile, AppNotification, Application, ApplicationState } from './types';
import { INITIAL_STEPS, MOCK_UNIVERSITIES, MOCK_SCHOLARSHIPS, Icons } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UniFinder from './components/UniFinder';
import DocumentMentor from './components/DocumentMentor';
import AiChat from './components/AiChat';
import Scholarships from './components/Scholarships';
import PeerMentor from './components/PeerMentor';
import ApplicationStatus from './components/ApplicationStatus';
import Profile from './components/Profile';
import EliteNetwork from './components/EliteNetwork';
import SmartMatch from './components/SmartMatch';
import Auth from './components/Auth';
import { geminiService } from './services/geminiService';
import { supabaseService, supabase } from './services/supabaseService';

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [steps, setSteps] = useState<ApplicationStep[]>([]);
  const [universities, setUniversities] = useState<University[]>([]); 
  const [applications, setApplications] = useState<Application[]>([]);

  const [user, setUser] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    country: '',
    gpa: '',
    satScore: '',
    targetMajor: '',
    avatarUrl: '',
    role: 'student',
    engagementStatus: 'idle',
    financialAidNeeded: false,
    bio: '',
    testScores: { toefl: '', ielts: '', det: '' }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsAuthenticated(true);
        // During signup, full_name is stored in user_metadata
        const userName = session.user.user_metadata?.full_name || '';
        fetchUserData(session.user.id, session.user.email!, userName);
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string, email: string, defaultName: string) => {
    setSyncStatus('syncing');
    try {
      // Step 1: Ensure profile exists in the 'profiles' table after session is active
      await supabaseService.ensureProfile({ id: userId, email }, defaultName);

      // Step 2: Parallel fetch of profile and related data
      const [profile, cloudApps, cloudRoadmap] = await Promise.all([
        supabaseService.getProfile(userId),
        supabaseService.getApplications(userId),
        supabaseService.getRoadmap(userId)
      ]);

      if (profile) {
        setUser(prev => ({ ...prev, ...profile }));
      }

      setApplications(cloudApps);
      setSteps(cloudRoadmap);
      
      const trackedUnis = cloudApps.map(app => {
        const local = MOCK_UNIVERSITIES.find(u => u.id === app.universityId);
        return local || null;
      }).filter(Boolean) as University[];
      setUniversities(trackedUnis);
      
      const now = new Date();
      setSyncStatus('saved');
      setLastSaved(now);
    } catch (e: any) {
      console.warn("Sync error", e);
      setSyncStatus('error');
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleLogout = async () => {
    await supabaseService.signOut();
    setIsAuthenticated(false);
  };

  const handleLogin = async () => {
    setNotifications([{ 
      id: `welcome-${Date.now()}`, 
      title: 'Portal Authenticated', 
      message: `Your secure admissions portal is now live and synchronized with the global database.`, 
      type: 'system', 
      timestamp: new Date(), 
      isRead: false 
    }]);
  };

  const handleProfileUpdate = async (updatedUser: UserProfile) => {
    setSyncStatus('syncing');
    setUser(updatedUser);
    
    try {
      await supabaseService.syncProfile(updatedUser);
      const now = new Date();
      setSyncStatus('saved');
      setLastSaved(now);
      
      setNotifications(prev => [{
        id: `profile-sync-${Date.now()}`,
        title: 'Cloud Commitment Successful',
        message: `Academic profile updated at ${now.toLocaleTimeString()}. Persistence verified.`,
        type: 'system',
        timestamp: now,
        isRead: false
      }, ...prev]);
    } catch (e: any) {
      const errorMsg = e.message || (typeof e === 'object' ? JSON.stringify(e) : String(e));
      console.error("Profile Sync failed:", errorMsg);
      setSyncStatus('error');
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleEngage = async () => {
    setIsGeneratingRoadmap(true);
    setSyncStatus('syncing');
    try {
      const generatedSteps = await geminiService.generateRoadmap(user);
      const updatedUser: UserProfile = { ...user, engagementStatus: 'engaged' };
      setUser(updatedUser);
      const finalSteps = generatedSteps.length > 0 ? generatedSteps : INITIAL_STEPS;
      setSteps(finalSteps);
      
      await Promise.all([
        supabaseService.syncProfile(updatedUser),
        supabaseService.syncRoadmap(user.id!, finalSteps)
      ]);

      setSyncStatus('saved');
      setLastSaved(new Date());
    } catch (err: any) {
      console.error("Engagement failure", err);
      setSyncStatus('error');
    } finally {
      setIsGeneratingRoadmap(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleToggleStep = async (stepId: string) => {
    setSyncStatus('syncing');
    const nextSteps = steps.map(step => {
      if (step.id === stepId) {
        const nextStatus: any = step.status === 'pending' ? 'in-progress' : 
                                 step.status === 'in-progress' ? 'completed' : 'pending';
        return { ...step, status: nextStatus };
      }
      return step;
    });
    setSteps(nextSteps);
    try {
      await supabaseService.syncRoadmap(user.id!, nextSteps);
      setSyncStatus('saved');
      setLastSaved(new Date());
    } catch (e: any) {
      setSyncStatus('error');
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const updateApplicationStatus = async (appId: string, status: ApplicationState) => {
    setSyncStatus('syncing');
    const nextApps = applications.map(app => app.id === appId ? { ...app, status } : app);
    setApplications(nextApps);
    try {
      await supabaseService.syncApplications(user.id!, nextApps);
      setSyncStatus('saved');
      setLastSaved(new Date());
    } catch (e: any) {
      setSyncStatus('error');
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const removeApplication = async (appId: string) => {
    setSyncStatus('syncing');
    const nextApps = applications.filter(app => app.id !== appId);
    setApplications(nextApps);
    try {
      await supabaseService.syncApplications(user.id!, nextApps);
      setSyncStatus('saved');
      setLastSaved(new Date());
    } catch (e: any) {
      setSyncStatus('error');
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const addApplication = async (uni: University) => {
    if (user.engagementStatus !== 'engaged') {
      alert("Please activate your tracker on the Dashboard roadmap first.");
      setActiveTab(AppTab.DASHBOARD);
      return;
    }
    const alreadyTracking = applications.some(app => app.universityId === uni.id);
    if (alreadyTracking) return;
    
    setSyncStatus('syncing');
    const newApp: Application = {
      id: `app-${Date.now()}`,
      universityId: uni.id,
      status: 'Submitted',
      appliedDate: new Date().toISOString()
    };
    const nextApps = [...applications, newApp];
    setApplications(nextApps);
    if (!universities.some(u => u.id === uni.id)) setUniversities(prev => [...prev, uni]);
    
    try {
      await supabaseService.syncApplications(user.id!, nextApps);
      setSyncStatus('saved');
      setLastSaved(new Date());
    } catch (e: any) {
      setSyncStatus('error');
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  if (!isAuthenticated && syncStatus === 'idle') return <Auth onLogin={handleLogin} />;

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      syncStatus={syncStatus}
      lastSaved={lastSaved}
      onUpdateUser={handleProfileUpdate} 
      notifications={notifications} 
      onNotificationClick={handleNotificationClick} 
      onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
      onLogout={handleLogout}
    >
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-3 leading-none uppercase">
            {activeTab.replace('_', ' ')}
          </h1>
          <p className="text-slate-500 font-bold text-sm md:text-base max-w-2xl leading-relaxed">
            International admissions ecosystem. All sessions are cloud-persistent.
          </p>
        </div>
      </div>

      {activeTab === AppTab.DASHBOARD && <Dashboard user={user} onUpdateUser={handleProfileUpdate} onEngage={handleEngage} steps={steps} universities={universities} scholarships={MOCK_SCHOLARSHIPS} isGeneratingRoadmap={isGeneratingRoadmap} onToggleStep={handleToggleStep} />}
      {activeTab === AppTab.STATUS && <ApplicationStatus applications={applications} universities={[...MOCK_UNIVERSITIES, ...universities]} onUpdateStatus={updateApplicationStatus} onRemove={removeApplication} onExplore={() => setActiveTab(AppTab.UNI_FINDER)} />}
      {activeTab === AppTab.PROFILE && <Profile user={user} onUpdateUser={handleProfileUpdate} lastSaved={lastSaved} syncStatus={syncStatus} />}
      {activeTab === AppTab.UNI_FINDER && <UniFinder onTrack={addApplication} trackingIds={applications.map(a => a.universityId)} />}
      {activeTab === AppTab.SMART_MATCH && <SmartMatch onTrack={addApplication} trackingIds={applications.map(a => a.universityId)} initialProfile={{ name: user.name, country: user.country, level: 'Undergraduate', field: user.targetMajor, gpa: user.gpa }} />}
      {activeTab === AppTab.SCHOLARSHIPS && <Scholarships />}
      {activeTab === AppTab.ELITE_NETWORK && <EliteNetwork user={user} />}
      {activeTab === AppTab.DOCUMENT_MENTOR && <DocumentMentor />}
      {activeTab === AppTab.PEER_MENTOR && <PeerMentor />}
      {activeTab === AppTab.AI_CHAT && <AiChat />}
    </Layout>
  );
};

export default App;
