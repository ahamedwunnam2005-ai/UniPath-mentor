
export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  country: string;
  gpa: string;
  satScore: string;
  targetMajor: string;
  avatarUrl: string;
  visionImageUrl?: string;
  bio?: string;
  role: 'student' | 'mentor' | 'admin';
  engagementStatus: 'idle' | 'engaged';
  testScores?: {
    toefl?: string;
    ielts?: string;
    det?: string;
  };
  financialAidNeeded: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'feedback' | 'message' | 'system';
  timestamp: Date;
  isRead: boolean;
  linkTab?: AppTab;
}

export type ApplicationState = 'Draft' | 'Submitted' | 'Under Review' | 'Interviewing' | 'Accepted' | 'Waitlisted' | 'Rejected';

export interface Application {
  id: string;
  universityId: string;
  status: ApplicationState;
  appliedDate?: string;
  notes?: string;
}

export interface University {
  id: string;
  name: string;
  location: string;
  state: string;
  rank: number;
  tags: string[];
  imageUrl: string;
  logoUrl?: string;
  financialAidType: 'Need-Blind' | 'Need-Aware';
  isCommonApp: boolean;
  region: string;
  country: string;
  applyUrl: string;
  isExternal?: boolean;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  deadline: string;
  focus: string;
  description: string;
  region: string;
  applyUrl: string;
  isExternal?: boolean;
  eligibility?: string[];
  essayRequirements?: string[];
  fundingBreakdown?: string;
}

export interface Mentor {
  id: string;
  name: string;
  university: string;
  major: string;
  origin: string;
  scholarship?: string;
  imageUrl: string;
}

export interface Network {
  id: string;
  name: string;
  category: 'Professional' | 'Student' | 'Alumni';
  focus: string[];
  description: string;
  url: string;
  iconType: 'tech' | 'law' | 'business' | 'general';
}

export interface ApplicationStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  urgency: 'low' | 'medium' | 'high';
  link?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Feedback {
  score: number;
  suggestions: string[];
  strengths: string[];
  rubricScores: { category: string; score: number }[];
  revisions: { original: string; suggested: string }[];
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  STATUS = 'status',
  PROFILE = 'profile',
  UNI_FINDER = 'uni_finder',
  SMART_MATCH = 'smart_match',
  SCHOLARSHIPS = 'scholarships',
  DOCUMENT_MENTOR = 'document_mentor',
  PEER_MENTOR = 'peer_mentor',
  ELITE_NETWORK = 'elite_network',
  AI_CHAT = 'ai_chat',
}
