import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState } from '@/types/study';

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
  pauseTimestamp: number | null; // when pause began
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch { /* ignore */ }
}

function clearSavedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

function loadState(): { state: TimerState; pauseTimestamp: number | null } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const persisted: PersistedTimerState = JSON.parse(raw);
    if (!persisted.isRunning || !persisted.startTime) return null;

    const now = Date.now();

    if (persisted.isPaused && persisted.pauseTimestamp) {
      // Was paused — elapsed stays frozen at the moment of pause
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

    // Was running — recalculate elapsed including time away
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
  } catch {
    return null;
  }
}

export function useTimer() {
  const [state, setState] = useState<TimerState>(() => {
    const loaded = loadState();
    return loaded ? loaded.state : INITIAL_STATE;
  });
  const intervalRef = useRef<number | null>(null);
  const pauseStartRef = useRef<number | null>(
    (() => {
      const loaded = loadState();
      return loaded ? loaded.pauseTimestamp : null;
    })()
  );

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
