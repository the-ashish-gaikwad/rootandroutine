import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState } from '@/types/study';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { db } from '@/lib/db';

const STORAGE_KEY = 'study-timer-state';

const INITIAL_STATE: TimerState = {
  isRunning: false,
  isPaused: false,
  subjectId: null,
  startTime: null,
  pausedTime: 0,
  elapsedTime: 0,
};

interface PersistedTimerState {
  isRunning: boolean;
  isPaused: boolean;
  subjectId: string | null;
  startTime: number | null;
  pausedTime: number;
  pauseTimestamp: number | null;
}

function saveState(state: TimerState, pauseTimestamp: number | null) {
  const persisted: PersistedTimerState = {
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    subjectId: state.subjectId,
    startTime: state.startTime,
    pausedTime: state.pausedTime,
    pauseTimestamp,
  };
  try {
    const compressed = compressToUTF16(JSON.stringify(persisted));
    db.compressed
      .put({ key: STORAGE_KEY, value: compressed, updatedAt: Date.now() })
      .catch(() => { /* ignore */ });
  } catch { /* ignore */ }
}

function clearSavedState() {
  db.compressed.delete(STORAGE_KEY).catch(() => { /* ignore */ });
}

function resolvePersistedState(
  persisted: PersistedTimerState
): { state: TimerState; pauseTimestamp: number | null } | null {
  if (!persisted.isRunning || !persisted.startTime) return null;

  const now = Date.now();

  if (persisted.isPaused && persisted.pauseTimestamp) {
    const elapsed = persisted.pauseTimestamp - persisted.startTime - persisted.pausedTime;
    return {
      state: {
        isRunning: true,
        isPaused: true,
        subjectId: persisted.subjectId,
        startTime: persisted.startTime,
        pausedTime: persisted.pausedTime,
        elapsedTime: Math.max(0, elapsed),
      },
      pauseTimestamp: persisted.pauseTimestamp,
    };
  }

  const elapsed = now - persisted.startTime - persisted.pausedTime;
  return {
    state: {
      isRunning: true,
      isPaused: false,
      subjectId: persisted.subjectId,
      startTime: persisted.startTime,
      pausedTime: persisted.pausedTime,
      elapsedTime: Math.max(0, elapsed),
    },
    pauseTimestamp: null,
  };
}

export function useTimer() {
  const [state, setState] = useState<TimerState>(INITIAL_STATE);
  const intervalRef = useRef<number | null>(null);
  const pauseStartRef = useRef<number | null>(null);
  const restoredRef = useRef(false);

  // Restore from IndexedDB on mount (async)
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    db.compressed
      .get(STORAGE_KEY)
      .then((record) => {
        if (!record) return;
        try {
          const json = decompressFromUTF16(record.value);
          if (!json) return;
          const persisted: PersistedTimerState = JSON.parse(json);
          const result = resolvePersistedState(persisted);
          if (result) {
            setState(result.state);
            pauseStartRef.current = result.pauseTimestamp;
          }
        } catch { /* ignore corrupt data */ }
      })
      .catch(() => { /* ignore */ });
  }, []);

  // Persist on every state change
  useEffect(() => {
    if (state.isRunning) {
      saveState(state, pauseStartRef.current);
    }
  }, [state]);

  // Update elapsed time every 100ms when running
  useEffect(() => {
    if (state.isRunning && !state.isPaused && state.startTime) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = now - state.startTime! - state.pausedTime;
        setState((prev) => ({ ...prev, elapsedTime: elapsed }));
      }, 100);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [state.isRunning, state.isPaused, state.startTime, state.pausedTime]);

  const start = useCallback((subjectId: string) => {
    const newState: TimerState = {
      isRunning: true,
      isPaused: false,
      subjectId,
      startTime: Date.now(),
      pausedTime: 0,
      elapsedTime: 0,
    };
    pauseStartRef.current = null;
    setState(newState);
    saveState(newState, null);
  }, []);

  const pause = useCallback(() => {
    if (!state.isRunning || state.isPaused) return;
    
    pauseStartRef.current = Date.now();
    setState((prev) => {
      const next = { ...prev, isPaused: true };
      saveState(next, pauseStartRef.current);
      return next;
    });
  }, [state.isRunning, state.isPaused]);

  const resume = useCallback(() => {
    if (!state.isRunning || !state.isPaused) return;
    
    const pauseDuration = pauseStartRef.current 
      ? Date.now() - pauseStartRef.current 
      : 0;
    
    pauseStartRef.current = null;
    setState((prev) => {
      const next = {
        ...prev,
        isPaused: false,
        pausedTime: prev.pausedTime + pauseDuration,
      };
      saveState(next, null);
      return next;
    });
  }, [state.isRunning, state.isPaused]);

  const stop = useCallback((): { subjectId: string; duration: number } | null => {
    if (!state.isRunning || !state.subjectId) return null;
    
    let finalElapsed = state.elapsedTime;
    
    if (state.isPaused && pauseStartRef.current) {
      // elapsedTime was frozen at pause, use as-is
    } else if (state.startTime) {
      finalElapsed = Date.now() - state.startTime - state.pausedTime;
    }
    
    const durationMinutes = Math.max(1, Math.round(finalElapsed / 60000));
    const result = {
      subjectId: state.subjectId,
      duration: durationMinutes,
    };

    setState(INITIAL_STATE);
    pauseStartRef.current = null;
    clearSavedState();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return result;
  }, [state]);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    pauseStartRef.current = null;
    clearSavedState();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    ...state,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
