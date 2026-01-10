
import React, { useState } from 'react';
import { Icons } from '../constants';
import { supabaseService } from '../services/supabaseService';

interface AuthProps {
  onLogin: (userData: { name: string; email: string }) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email || !password || !name) {
          setError('Academic identity (Name, Email, Password) is required.');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Security policy: Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        
        // 1️⃣ Attempt Signup
        const data = await supabaseService.signUp(email, password, name);
        
        // 2️⃣ Attempt profile stabilization
        if (data?.user) {
          await supabaseService.ensureProfile(data.user, name);
        }
        
        setIsEmailSent(true);
      } else if (mode === 'login') {
        if (!email || !password) {
          setError('Email and password are required for portal access.');
          setLoading(false);
          return;
        }
        await supabaseService.signIn(email, password);
      }
    } catch (err: any) {
      console.error('Portal Auth Error:', err);
      let userFriendlyMessage = err.message || 'Authentication failed. Please check your network connection.';
      
      // Map Supabase errors to helpful user messages
      if (userFriendlyMessage.includes('Invalid login credentials')) {
        userFriendlyMessage = 'Invalid credentials. If you just registered, please verify your email address via the link in your inbox.';
      } else if (userFriendlyMessage.includes('Database error saving new user')) {
        userFriendlyMessage = 'Admissions Registry Error: A database sync issue occurred. This often happens if the profile table is missing columns. Try using a different email address or contact support.';
      } else if (userFriendlyMessage.includes('User already registered')) {
        userFriendlyMessage = 'An account with this email already exists. Try signing in.';
      }
      
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
             <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Verify your identity</h3>
          <p className="text-slate-500 font-bold leading-relaxed">
            We've sent a verification link to <span className="text-indigo-600">{email}</span>. Please click the link to activate your global admissions portal.
          </p>
          <button 
            onClick={() => setIsEmailSent(false)}
            className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-white overflow-hidden font-sans">
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[120px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="relative z-10 p-16 max-w-2xl">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white font-black text-3xl mb-12 shadow-2xl">U</div>
          <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.9] mb-8">Your bridge to <br/><span className="text-indigo-400">Global Excellence.</span></h2>
          <p className="text-indigo-200/60 text-lg font-medium leading-relaxed mb-12 max-w-lg">Join the elite circle of international scholars. Access AI-powered matching and mentorship.</p>
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative bg-white">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create Account' : 'Recover Portal'}
            </h3>
            <p className="text-slate-500 font-bold text-sm">
              {mode === 'login' ? 'Enter your academic credentials.' : 'Start your global application journey.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
              <div className="w-1 h-1 bg-rose-600 rounded-full shrink-0" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="group animate-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input
                  type="text" required placeholder="Samuel Okoro"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-700 transition-all"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email" required placeholder="name@university.edu"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-700 transition-all"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {mode !== 'forgot' && (
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-700 transition-all"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 p-1 transition-all">
                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
                {mode === 'signup' && (
                   <p className="text-[9px] font-bold text-slate-400 mt-2 ml-1 uppercase tracking-widest">Min. 6 characters required</p>
                )}
              </div>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full py-5 bg-indigo-900 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : mode === 'login' ? 'Authenticate' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-12 text-center lg:text-left border-t border-slate-50 pt-8">
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-indigo-600 font-black uppercase tracking-widest hover:underline">
              {mode === 'login' ? 'Create Account' : 'Sign In Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
