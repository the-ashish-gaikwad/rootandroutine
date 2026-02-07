import { useMemo, useCallback } from 'react';
import { useCompressedStorage } from './useCompressedStorage';
import {
  Subject,
  StudySession,
  StudyStats,
  PastelColor,
  PASTEL_COLORS,
  generateId,
  ExportData,
} from '@/types/study';
import { 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  isAfter, 
  isSameDay, 
  subDays, 
  parseISO,
  format 
} from 'date-fns';

const STORAGE_KEYS = {
  subjects: 'study-tracker-subjects',
  sessions: 'study-tracker-sessions',
};

export function useStudyData() {
  const [subjects, setSubjects] = useCompressedStorage<Subject[]>(STORAGE_KEYS.subjects, []);
  const [sessions, setSessions] = useCompressedStorage<StudySession[]>(STORAGE_KEYS.sessions, []);

  // Get the next available color for a new subject
  const getNextColor = useCallback((): PastelColor => {
    const usedColors = subjects.map((s) => s.color);
    const availableColor = PASTEL_COLORS.find((c) => !usedColors.includes(c));
    return availableColor || PASTEL_COLORS[subjects.length % PASTEL_COLORS.length];
  }, [subjects]);

  // Subject CRUD operations
  const addSubject = useCallback(
    (name: string, color?: PastelColor): Subject => {
      const sanitizedName = name.trim().slice(0, 50); // XSS protection: limit length
      const newSubject: Subject = {
        id: generateId(),
        name: sanitizedName,
        color: color || getNextColor(),
        createdAt: new Date().toISOString(),
      };
      setSubjects((prev) => [...prev, newSubject]);
      return newSubject;
    },
    [getNextColor, setSubjects]
  );

  const updateSubject = useCallback(
    (id: string, updates: Partial<Pick<Subject, 'name' | 'color'>>) => {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...(updates.name && { name: updates.name.trim().slice(0, 50) }),
                ...(updates.color && { color: updates.color }),
              }
            : s
        )
      );
    },
    [setSubjects]
  );

  const deleteSubject = useCallback(
    (id: string) => {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      // Also delete all sessions for this subject
      setSessions((prev) => prev.filter((s) => s.subjectId !== id));
    },
    [setSubjects, setSessions]
  );

  // Session CRUD operations
  const addSession = useCallback(
    (session: Omit<StudySession, 'id' | 'createdAt'>): StudySession => {
      const newSession: StudySession = {
        ...session,
        id: generateId(),
        notes: session.notes?.trim().slice(0, 500), // XSS protection
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [...prev, newSession]);
      return newSession;
    },
    [setSessions]
  );

  const updateSession = useCallback(
    (id: string, updates: Partial<Omit<StudySession, 'id' | 'createdAt'>>) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...updates,
                ...(updates.notes && { notes: updates.notes.trim().slice(0, 500) }),
              }
            : s
        )
      );
    },
    [setSessions]
  );

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    },
    [setSessions]
  );

  // Calculate study statistics
  const stats = useMemo((): StudyStats => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const monthStart = startOfMonth(now);

    let today = 0;
    let thisWeek = 0;
    let thisMonth = 0;

    sessions.forEach((session) => {
      const sessionDate = parseISO(session.date);
      
      if (isSameDay(sessionDate, now)) {
        today += session.duration;
      }
      
      if (isAfter(sessionDate, weekStart) || isSameDay(sessionDate, weekStart)) {
        thisWeek += session.duration;
      }
      
      if (isAfter(sessionDate, monthStart) || isSameDay(sessionDate, monthStart)) {
        thisMonth += session.duration;
      }
    });

    // Calculate streak
    let streak = 0;
    let checkDate = startOfDay(now);
    
    while (true) {
      const hasSession = sessions.some((s) => isSameDay(parseISO(s.date), checkDate));
      if (hasSession) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return { today, thisWeek, thisMonth, streak };
  }, [sessions]);

  // Get sessions for a specific date range
  const getSessionsByDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return sessions.filter((session) => {
        const sessionDate = parseISO(session.date);
        return (
          (isAfter(sessionDate, startDate) || isSameDay(sessionDate, startDate)) &&
          (isSameDay(sessionDate, endDate) || !isAfter(sessionDate, endDate))
        );
      });
    },
    [sessions]
  );

  // Get subject by ID
  const getSubjectById = useCallback(
    (id: string): Subject | undefined => {
      return subjects.find((s) => s.id === id);
    },
    [subjects]
  );

  // Export data
  const exportData = useCallback((): string => {
    const data: ExportData = {
      subjects,
      sessions,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(data, null, 2);
  }, [subjects, sessions]);

  // Import data
  const importData = useCallback(
    (jsonString: string): boolean => {
      try {
        const data = JSON.parse(jsonString) as ExportData;
        
        if (!Array.isArray(data.subjects) || !Array.isArray(data.sessions)) {
          throw new Error('Invalid data format');
        }
        
        setSubjects(data.subjects);
        setSessions(data.sessions);
        return true;
      } catch (error) {
        console.error('Import failed:', error);
        return false;
      }
    },
    [setSubjects, setSessions]
  );

  // Clear all data
  const clearAllData = useCallback(() => {
    setSubjects([]);
    setSessions([]);
  }, [setSubjects, setSessions]);

  return {
    // Data
    subjects,
    sessions,
    stats,
    
    // Subject operations
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectById,
    getNextColor,
    
    // Session operations
    addSession,
    updateSession,
    deleteSession,
    getSessionsByDateRange,
    
    // Data management
    exportData,
    importData,
    clearAllData,
  };
}
