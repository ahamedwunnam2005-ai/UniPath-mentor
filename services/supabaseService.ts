
import { createClient } from '@supabase/supabase-js';
import { UserProfile, Application, ApplicationStep } from '../types';

// Use the exact keys provided by the user
const SUPABASE_URL = 'https://hhsoaldbwvugtawtfixc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc29hbGRid3Z1Z3Rhd3RmaXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3Mzg3OTgsImV4cCI6MjA4MzMxNDc5OH0.ZnGAkXQXwRCEk5XOKSz3Qv8awcWWrDSPlXk9fIYwmh0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseService = {
  // Auth Methods
  async signUp(email: string, password: string, fullName?: string) {
    // The "Database error saving new user" typically indicates a failing trigger on the auth.users table.
    // Triggers often expect 'full_name' in user_metadata. We provide it along with 'name' to satisfy various schemas.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          name: fullName || email.split('@')[0],
          role: 'student'
        }
      }
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Safe Profile Initialization Helper
  // Called immediately after signup to ensure a record exists even if the trigger failed.
  async ensureProfile(user: { id: string; email?: string }, name?: string) {
    const now = new Date().toISOString();
    try {
      // We attempt to upsert into 'profiles' using 'id'. 
      // This is the primary table expected by the UI.
      await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email ?? null,
            full_name: name ?? null,
            updated_at: now
          },
          { onConflict: 'id' }
        );
    } catch (e) {
      console.warn('Profile initialization warning:', e);
    }

    // Based on user provided SQL snippet, we also try 'user_profiles' with 'auth_id'
    // to satisfy custom backend triggers that might be causing the "Database error".
    try {
      await supabase
        .from('user_profiles')
        .upsert(
          {
            auth_id: user.id,
            updated_at: now
          },
          { onConflict: 'auth_id' }
        );
    } catch (e) {
      // Ignore if table doesn't exist
    }
  },

  // Storage Methods
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file, { contentType: file.type, upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage.from('user-assets').getPublicUrl(filePath);
    return data.publicUrl;
  },

  // Profile Methods
  async syncProfile(profile: UserProfile): Promise<void> {
    if (!profile.id) return;
    
    const now = new Date().toISOString();
    const profileData: any = {
      id: profile.id,
      email: profile.email,
      full_name: profile.name || '',
      role: profile.role || 'student',
      country: profile.country || '',
      gpa: profile.gpa || '', 
      sat_score: profile.satScore || '',
      test_scores: profile.testScores || {},
      avatar_url: profile.avatarUrl || '',
      bio: profile.bio || '',
      engagement_status: profile.engagementStatus || 'idle',
      financial_aid_needed: profile.financialAidNeeded || false,
      target_major: profile.targetMajor || '',
      vision_image_url: profile.visionImageUrl || '',
      updated_at: now,
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData);

    if (error) {
      console.error('Full Sync Error:', error.message);
      // Fallback: minimal sync
      const minimalData = {
        id: profile.id,
        email: profile.email,
        full_name: profile.name || '',
        updated_at: now
      };
      const { error: fallbackError } = await supabase.from('profiles').upsert(minimalData);
      if (fallbackError) throw new Error(`Critical DB Error: ${fallbackError.message}`);
    }
  },

  async getProfile(userId: string): Promise<Partial<UserProfile> | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Fetch Profile Error:', error.message);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.full_name || data.name || '', 
      email: data.email || '',
      role: data.role || 'student',
      country: data.country || '',
      gpa: data.gpa || data.weighted_gpa || '',
      satScore: data.sat_score || '',
      targetMajor: data.target_major || '',
      avatarUrl: data.avatar_url || '',
      visionImageUrl: data.vision_image_url || '',
      bio: data.bio || '',
      engagementStatus: data.engagement_status || 'idle',
      testScores: data.test_scores || { toefl: '', ielts: '', det: '' },
      financialAidNeeded: data.financial_aid_needed || false
    };
  },

  // Applications Persistence
  async syncApplications(userId: string, apps: Application[]): Promise<void> {
    const { error: deleteError } = await supabase.from('user_applications').delete().eq('user_id', userId);
    if (deleteError) console.warn("Cleanup warning:", deleteError.message);

    if (apps.length === 0) return;
    
    const { error } = await supabase.from('user_applications').insert(
      apps.map(app => ({
        id: app.id,
        user_id: userId,
        university_id: app.universityId,
        status: app.status,
        applied_date: app.appliedDate,
        notes: app.notes
      }))
    );
    if (error) throw new Error(`App sync failed: ${error.message}`);
  },

  async getApplications(userId: string): Promise<Application[]> {
    const { data, error } = await supabase.from('user_applications').select('*').eq('user_id', userId);
    if (error) return [];
    return data.map(d => ({
      id: d.id,
      universityId: d.university_id,
      status: d.status,
      appliedDate: d.applied_date,
      notes: d.notes
    }));
  },

  // Roadmap Persistence
  async syncRoadmap(userId: string, steps: ApplicationStep[]): Promise<void> {
    const { error: deleteError } = await supabase.from('roadmap_steps').delete().eq('user_id', userId);
    if (deleteError) console.warn("Roadmap Cleanup warning:", deleteError.message);

    if (steps.length === 0) return;

    const { error } = await supabase.from('roadmap_steps').insert(
      steps.map(s => ({
        id: s.id,
        user_id: userId,
        title: s.title,
        status: s.status,
        due_date: s.dueDate,
        urgency: s.urgency,
        link: s.link
      }))
    );
    if (error) throw new Error(`Roadmap sync failed: ${error.message}`);
  },

  async getRoadmap(userId: string): Promise<ApplicationStep[]> {
    const { data, error } = await supabase.from('roadmap_steps').select('*').eq('user_id', userId);
    if (error) return [];
    return data.map(d => ({
      id: d.id,
      title: d.title,
      status: d.status,
      dueDate: d.due_date,
      urgency: d.urgency,
      link: d.link
    }));
  }
};
