import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState } from '@/types/study';

const INITIAL_STATE: TimerState = {
  isRunning: false,
  isPaused: false,
  subjectId: null,
  startTime: null,
  pausedTime: 0,
  elapsedTime: 0,
};

export function useTimer() {
  const [state, setState] = useState<TimerState>(INITIAL_STATE);
  const intervalRef = useRef<number | null>(null);
  const pauseStartRef = useRef<number | null>(null);

  // Update elapsed time every second when running
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
    setState({
      isRunning: true,
      isPaused: false,
      subjectId,
      startTime: Date.now(),
      pausedTime: 0,
      elapsedTime: 0,
    });
  }, []);

  const pause = useCallback(() => {
    if (!state.isRunning || state.isPaused) return;
    
    pauseStartRef.current = Date.now();
    setState((prev) => ({ ...prev, isPaused: true }));
  }, [state.isRunning, state.isPaused]);

  const resume = useCallback(() => {
    if (!state.isRunning || !state.isPaused) return;
    
    const pauseDuration = pauseStartRef.current 
      ? Date.now() - pauseStartRef.current 
      : 0;
    
    pauseStartRef.current = null;
    setState((prev) => ({
      ...prev,
      isPaused: false,
      pausedTime: prev.pausedTime + pauseDuration,
    }));
  }, [state.isRunning, state.isPaused]);

  const stop = useCallback((): { subjectId: string; duration: number } | null => {
    if (!state.isRunning || !state.subjectId) return null;
    
    // Calculate final duration in minutes
    let finalElapsed = state.elapsedTime;
    
    // If currently paused, don't count the current pause duration
    if (state.isPaused && pauseStartRef.current) {
      // elapsedTime was frozen at pause, use it as-is
    } else if (state.startTime) {
      // Calculate fresh if still running
      finalElapsed = Date.now() - state.startTime - state.pausedTime;
    }
    
    const durationMinutes = Math.max(1, Math.round(finalElapsed / 60000)); // At least 1 minute
    const result = {
      subjectId: state.subjectId,
      duration: durationMinutes,
    };

    // Reset state
    setState(INITIAL_STATE);
    pauseStartRef.current = null;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return result;
  }, [state]);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    pauseStartRef.current = null;
    
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
