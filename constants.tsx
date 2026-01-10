
import React from 'react';
import { University, Scholarship, ApplicationStep, Mentor, Network } from './types';

export const MOCK_UNIVERSITIES: University[] = [
  {
    id: '1',
    name: 'Harvard University',
    location: 'Cambridge, MA',
    state: 'MA',
    rank: 1,
    tags: ['Ivy League', 'Research', 'Elite'],
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://logo.clearbit.com/harvard.edu',
    financialAidType: 'Need-Blind',
    isCommonApp: true,
    region: 'North America',
    country: 'USA',
    applyUrl: 'https://college.harvard.edu/admissions/apply'
  },
  {
    id: '2',
    name: 'University of Oxford',
    location: 'Oxford, UK',
    state: 'Oxfordshire',
    rank: 2,
    tags: ['Historic', 'Research', 'Global'],
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://logo.clearbit.com/ox.ac.uk',
    financialAidType: 'Need-Aware',
    isCommonApp: false,
    region: 'Europe',
    country: 'UK',
    applyUrl: 'https://www.ox.ac.uk/admissions/undergraduate/applying-to-oxford'
  },
  {
    id: '3',
    name: 'Stanford University',
    location: 'Stanford, CA',
    state: 'CA',
    rank: 3,
    tags: ['Tech', 'Innovation', 'Entrepreneurial'],
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://logo.clearbit.com/stanford.edu',
    financialAidType: 'Need-Aware',
    isCommonApp: true,
    region: 'North America',
    country: 'USA',
    applyUrl: 'https://admission.stanford.edu/apply/'
  },
  {
    id: '4',
    name: 'ETH Zurich',
    location: 'Zurich, Switzerland',
    state: 'Zurich',
    rank: 7,
    tags: ['Engineering', 'STEM', 'Innovation'],
    imageUrl: 'https://images.unsplash.com/photo-1590072223844-5383f125a075?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://logo.clearbit.com/ethz.ch',
    financialAidType: 'Need-Aware',
    isCommonApp: false,
    region: 'Europe',
    country: 'Switzerland',
    applyUrl: 'https://ethz.ch/en/studies/registration-application.html'
  },
  {
    id: '5',
    name: 'Yale University',
    location: 'New Haven, CT',
    state: 'CT',
    rank: 5,
    tags: ['Ivy League', 'Liberal Arts', 'Elite'],
    imageUrl: 'https://images.unsplash.com/photo-1610486658032-aa15a5197825?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://logo.clearbit.com/yale.edu',
    financialAidType: 'Need-Blind',
    isCommonApp: true,
    region: 'North America',
    country: 'USA',
    applyUrl: 'https://admissions.yale.edu/applying-yale-international-student'
  },
  {
    id: '6',
    name: 'Princeton University',
    location: 'Princeton, NJ',
    state: 'NJ',
    rank: 1,
    tags: ['Ivy League', 'Undergrad Focus', 'Elite'],
    imageUrl: 'https://images.unsplash.com/photo-1582294154949-015ba6a90826?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://logo.clearbit.com/princeton.edu',
    financialAidType: 'Need-Blind',
    isCommonApp: true,
    region: 'North America',
    country: 'USA',
    applyUrl: 'https://admission.princeton.edu/apply'
  },
  {
    id: '7',
    name: 'Columbia University',
    location: 'New York, NY',
    state: 'NY',
    rank: 12,
    tags: ['Ivy League', 'Urban', 'Global'],
    imageUrl: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://logo.clearbit.com/columbia.edu',
    financialAidType: 'Need-Aware',
    isCommonApp: true,
    region: 'North America',
    country: 'USA',
    applyUrl: 'https://undergrad.admissions.columbia.edu/apply'
  },
  {
    id: '8',
    name: 'MIT',
    location: 'Cambridge, MA',
    state: 'MA',
    rank: 2,
    tags: ['Engineering', 'STEM', 'Innovation'],
    imageUrl: 'https://images.unsplash.com/photo-1545670723-196ed0954986?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://logo.clearbit.com/mit.edu',
    financialAidType: 'Need-Blind',
    isCommonApp: false,
    region: 'North America',
    country: 'USA',
    applyUrl: 'https://mitadmissions.org/apply/'
  },
  {
    id: '9',
    name: 'University of Chicago',
    location: 'Chicago, IL',
    state: 'IL',
    rank: 11,
    tags: ['Intensive', 'Research', 'Intellectual'],
    imageUrl: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://logo.clearbit.com/uchicago.edu',
    financialAidType: 'Need-Aware',
    isCommonApp: true,
    region: 'North America',
    country: 'USA',
    applyUrl: 'https://collegeadmissions.uchicago.edu/apply'
  },
  {
    id: '10',
    name: 'University of Pennsylvania',
    location: 'Philadelphia, PA',
    state: 'PA',
    rank: 6,
    tags: ['Ivy League', 'Business', 'Research'],
    imageUrl: 'https://images.unsplash.com/photo-1579389083395-4507e9f4a171?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://logo.clearbit.com/upenn.edu',
    financialAidType: 'Need-Aware',
    isCommonApp: true,
    region: 'North America',
    country: 'USA',
    applyUrl: 'https://admissions.upenn.edu/admissions-and-financial-aid/apply'
  }
];

export const MOCK_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 's1',
    name: 'Mastercard Foundation Scholars',
    provider: 'Mastercard Foundation',
    amount: 'Full Ride (Tuition + Stipend)',
    deadline: '2026-12-01',
    focus: 'Leadership in Africa',
    description: 'Premier scholarship for students from sub-Saharan Africa with strong leadership potential and financial need.',
    region: 'Global',
    applyUrl: 'https://mastercardfdn.org/all/scholars/becoming-a-scholar/apply-to-the-scholars-program/',
    eligibility: [
      'Citizens of sub-Saharan African countries',
      'Demonstrated financial need',
      'Strong academic record',
      'Commitment to giving back to home country'
    ],
    essayRequirements: [
      'Personal statement on leadership journey',
      'Essay on community impact and future goals'
    ],
    fundingBreakdown: 'Full tuition fees, travel, health insurance, monthly living stipend, and laptop.'
  },
  {
    id: 's2',
    name: 'Ashinaga Africa Initiative',
    provider: 'Ashinaga Foundation',
    amount: 'Full Tuition + Living Expenses',
    deadline: '2027-01-20',
    focus: 'Orphaned Students',
    description: 'Global leadership program that supports orphaned students from sub-Saharan Africa to study abroad.',
    region: 'Global',
    applyUrl: 'https://www.ashinaga.org/en/our-work/ashinaga-africa-initiative/apply-to-the-aai/',
    eligibility: [
      'Citizens of sub-Saharan African countries',
      'Have lost one or both parents',
      'Completed secondary school in the last two years',
      'Strong academic performance'
    ],
    essayRequirements: [
      'Personal story of resilience',
      'Vision for Africa\'s future development'
    ],
    fundingBreakdown: 'Tuition, accommodation, travel, and a monthly stipend for food and personal expenses.'
  },
  {
    id: 's3',
    name: 'Opportunity Funds Program',
    provider: 'EducationUSA',
    amount: 'Upfront App Costs (SAT/Visa)',
    deadline: '2026-04-15',
    focus: 'High-achieving, Low-income',
    description: 'Helps students pay for the upfront costs of applying to US colleges including testing and application fees.',
    region: 'North America',
    applyUrl: 'https://educationusa.state.gov/centers/opportunity-funds-program',
    eligibility: [
      'High-achieving international students',
      'Unable to afford application costs',
      'Applying for undergraduate or graduate study in the US'
    ],
    fundingBreakdown: 'Covers SAT/ACT/TOEFL fees, application fees, SEVIS and visa fees, and initial travel to the US.'
  },
  {
    id: 's4',
    name: 'Rhodes Scholarship',
    provider: 'Rhodes Trust',
    amount: 'Full Graduate Funding',
    deadline: '2026-10-01',
    focus: 'Character & Leadership',
    description: 'The oldest and perhaps most prestigious international scholarship program, supporting students at the University of Oxford.',
    region: 'Europe',
    applyUrl: 'https://www.rhodeshouse.ox.ac.uk/scholarships/applications/',
    eligibility: [
      'Graduating seniors or recent graduates',
      'Exceptional academic achievement',
      'Moral force of character and leadership'
    ],
    essayRequirements: [
      'Personal statement (750 words)',
      'Academic statement of study'
    ],
    fundingBreakdown: 'All university and college fees, personal stipend, and private health insurance.'
  }
];

export const MOCK_MENTORS: Mentor[] = [
  {
    id: 'm1',
    name: 'Kofi Mensah',
    university: 'Yale University',
    major: 'Computer Science',
    origin: 'Ghana',
    scholarship: 'Mastercard Foundation',
    imageUrl: 'https://picsum.photos/seed/kofi/200/200'
  },
  {
    id: 'm2',
    name: 'Amina Yusuf',
    university: 'Columbia University',
    major: 'International Relations',
    origin: 'Nigeria',
    scholarship: 'Opportunity Fund',
    imageUrl: 'https://picsum.photos/seed/amina/200/200'
  }
];

export const MOCK_NETWORKS: Network[] = [
  {
    id: 'n1',
    name: 'NSBE (National Society of Black Engineers)',
    category: 'Professional',
    focus: ['Engineering', 'Technology', 'STEM'],
    description: 'One of the largest student-governed organizations based in the US, supporting black engineers through leadership and technical training.',
    url: 'https://www.nsbe.org',
    iconType: 'tech'
  },
  {
    id: 'n2',
    name: 'SEO Africa (Sponsors for Educational Opportunity)',
    category: 'Professional',
    focus: ['Investment Banking', 'Consulting', 'Private Equity'],
    description: 'Connects high-achieving African students with world-class internship and full-time opportunities in global financial hubs.',
    url: 'https://www.seo-africa.org',
    iconType: 'business'
  },
  {
    id: 'n3',
    name: 'Black in AI',
    category: 'Professional',
    focus: ['Artificial Intelligence', 'Machine Learning', 'Research'],
    description: 'A multi-institutional initiative for black researchers in AI. Provides travel grants, mentorship, and a global database of researchers.',
    url: 'https://blackinai.github.io',
    iconType: 'tech'
  },
  {
    id: 'n4',
    name: 'African Leadership Network (ALN)',
    category: 'Professional',
    focus: ['Leadership', 'Entrepreneurship', 'Venture Capital'],
    description: 'A community of dynamic African leaders committed to creating prosperity in Africa. Exclusive access to leadership summits and investment circles.',
    url: 'https://www.africanleadershipnetwork.com',
    iconType: 'business'
  },
  {
    id: 'n5',
    name: 'Lawyers Without Borders (African Chapters)',
    category: 'Professional',
    focus: ['Rule of Law', 'Human Rights', 'International Law'],
    description: 'Engages legal professionals from across the continent in pro-bono work and international legal development projects.',
    url: 'https://www.lwob.org',
    iconType: 'law'
  },
  {
    id: 'n6',
    name: 'Rhodes Trust Alumni Association',
    category: 'Alumni',
    focus: ['Global Impact', 'Research', 'Public Policy'],
    description: 'The global alumni network of Rhodes Scholars. A lifelong community of over 5,000 scholars working in various sectors globally.',
    url: 'https://www.rhodeshouse.ox.ac.uk',
    iconType: 'general'
  },
  {
    id: 'n7',
    name: 'Mastercard Foundation Alumni Network',
    category: 'Alumni',
    focus: ['Social Impact', 'Community Development', 'Higher Education'],
    description: 'A network for former Mastercard Foundation scholars to collaborate on projects that drive transformation across the African continent.',
    url: 'https://mastercardfdn.org',
    iconType: 'general'
  }
];

export const INITIAL_STEPS: ApplicationStep[] = [
  { id: '1', title: 'SAT/ACT Registration', status: 'completed', dueDate: '2026-05-10', urgency: 'low', link: 'https://www.collegeboard.org' },
  { id: '2', title: 'Common App Personal Statement', status: 'in-progress', dueDate: '2026-08-15', urgency: 'high', link: 'https://www.commonapp.org' }
];

export const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Status: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Profile: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Globe: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
    </svg>
  ),
  Cash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Network: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Message: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Star: (props: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Eye: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057-5.064-7 9.542-7 1.053 0 2.062.18 3 .512M7.943 7.943l1.114 1.114M11.25 11.25l1.5 1.5M16.057 16.057l1.114 1.114M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
    </svg>
  )
};
