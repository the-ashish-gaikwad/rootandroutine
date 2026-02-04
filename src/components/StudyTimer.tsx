import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause, Square, Timer } from 'lucide-react';
import { Subject, formatTime } from '@/types/study';
import { cn } from '@/lib/utils';

interface StudyTimerProps {
  subjects: Subject[];
  isRunning: boolean;
  isPaused: boolean;
  elapsedTime: number;
  selectedSubjectId: string | null;
  onStart: (subjectId: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSubjectSelect: (subjectId: string) => void;
}

export function StudyTimer({
  subjects,
  isRunning,
  isPaused,
  elapsedTime,
  selectedSubjectId,
  onStart,
  onPause,
  onResume,
  onStop,
  onSubjectSelect,
}: StudyTimerProps) {
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleStartClick = () => {
    if (selectedSubjectId) {
      onStart(selectedSubjectId);
    }
  };

  return (
    <Card className="notebook-shadow border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-handwritten text-2xl">
          <Timer className="w-5 h-5 text-primary" />
          Study Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subject selector */}
        <Select
          value={selectedSubjectId || ''}
          onValueChange={onSubjectSelect}
          disabled={isRunning}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select a subject..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border z-50">
            {subjects.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Add subjects first
              </div>
            ) : (
              subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn('w-3 h-3 rounded-full', `bg-pastel-${subject.color}`)}
                    />
                    {subject.name}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Timer display */}
        <div
          className={cn(
            'text-center py-6 rounded-lg transition-colors',
            isRunning && !isPaused
              ? 'bg-primary/10 animate-pulse-soft'
              : 'bg-muted/50'
          )}
        >
          <p className="text-4xl font-mono font-bold tracking-wider">
            {formatTime(elapsedTime)}
          </p>
          {selectedSubject && isRunning && (
            <p className="text-sm text-muted-foreground mt-2">
              Studying: {selectedSubject.name}
            </p>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStartClick}
              disabled={!selectedSubjectId || subjects.length === 0}
              className="flex-1 gap-2"
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button onClick={onResume} variant="secondary" className="flex-1 gap-2">
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              ) : (
                <Button onClick={onPause} variant="secondary" className="flex-1 gap-2">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              <Button onClick={onStop} variant="destructive" className="flex-1 gap-2">
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
