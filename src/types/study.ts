// Subject type with pastel color assignment
export interface Subject {
  id: string;
  name: string;
  color: PastelColor;
  createdAt: string;
}

// Available pastel colors for subjects
export type PastelColor = 
  | 'mint' 
  | 'lavender' 
  | 'peach' 
  | 'pink' 
  | 'blue' 
  | 'yellow' 
  | 'sage' 
  | 'coral';

export const PASTEL_COLORS: PastelColor[] = [
  'mint',
  'lavender',
  'peach',
  'pink',
  'blue',
  'yellow',
  'sage',
  'coral',
];

// Map color names to Tailwind classes
export const colorToClass: Record<PastelColor, string> = {
  mint: 'bg-pastel-mint',
  lavender: 'bg-pastel-lavender',
  peach: 'bg-pastel-peach',
  pink: 'bg-pastel-pink',
  blue: 'bg-pastel-blue',
  yellow: 'bg-pastel-yellow',
  sage: 'bg-pastel-sage',
  coral: 'bg-pastel-coral',
};

export const colorToHex: Record<PastelColor, string> = {
  mint: 'hsl(170, 45%, 75%)',
  lavender: 'hsl(270, 40%, 80%)',
  peach: 'hsl(20, 60%, 80%)',
  pink: 'hsl(340, 50%, 82%)',
  blue: 'hsl(210, 50%, 80%)',
  yellow: 'hsl(45, 60%, 80%)',
  sage: 'hsl(140, 30%, 75%)',
  coral: 'hsl(5, 55%, 78%)',
};

// Study session record
export interface StudySession {
  id: string;
  subjectId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  duration: number; // Duration in minutes
  startTime?: string; // ISO timestamp when session started
  endTime?: string; // ISO timestamp when session ended
  notes?: string;
  createdAt: string;
}

// Timer state for active study session
export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  subjectId: string | null;
  startTime: number | null; // Unix timestamp
  pausedTime: number; // Accumulated paused time in ms
  elapsedTime: number; // Current elapsed time in ms
}

// Chart view options
export type ChartView = 'daily' | 'weekly' | 'monthly';

// Bar chart display mode
export type BarMode = 'stacked' | 'simple';

// Statistics data
export interface StudyStats {
  today: number; // minutes
  thisWeek: number; // minutes
  thisMonth: number; // minutes
  streak: number; // consecutive days
}

// Data export format
export interface ExportData {
  subjects: Subject[];
  sessions: StudySession[];
  exportedAt: string;
  version: string;
}

// Helper to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format duration for display
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) {
    return `${mins}min`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}min`;
};

// Format time from milliseconds
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  
  return `${pad(minutes)}:${pad(seconds)}`;
};
