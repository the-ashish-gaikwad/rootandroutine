import React, { useState } from 'react';
import { format } from 'date-fns';
import { useStudyData } from '@/hooks/useStudyData';
import { useTimer } from '@/hooks/useTimer';
import { useToast } from '@/hooks/use-toast';
import { ChartView, BarMode } from '@/types/study';
import { StudyChart } from '@/components/StudyChart';
import { StatsCards } from '@/components/StatsCards';
import { StudyTimer } from '@/components/StudyTimer';
import { ManualEntry } from '@/components/ManualEntry';
import { SubjectManager } from '@/components/SubjectManager';
import { SessionHistory } from '@/components/SessionHistory';
import { ChartControls } from '@/components/ChartControls';
import { BookOpen } from 'lucide-react';
const Index = () => {
  const {
    toast
  } = useToast();
  const {
    subjects,
    sessions,
    stats,
    addSubject,
    updateSubject,
    deleteSubject,
    addSession,
    deleteSession,
    exportData,
    clearAllData,
    getNextColor
  } = useStudyData();
  const timer = useTimer();

  // Chart state
  const [chartView, setChartView] = useState<ChartView>('daily');
  const [barMode, setBarMode] = useState<BarMode>('stacked');

  // Timer subject selection (before starting)
  const [timerSubjectId, setTimerSubjectId] = useState<string | null>(subjects[0]?.id || null);

  // Handle timer start
  const handleTimerStart = (subjectId: string) => {
    timer.start(subjectId);
    toast({
      title: 'Timer started',
      description: `Studying ${subjects.find(s => s.id === subjectId)?.name}`
    });
  };

  // Handle timer stop - save the session
  const handleTimerStop = () => {
    const result = timer.stop();
    if (result) {
      const today = format(new Date(), 'yyyy-MM-dd');
      addSession({
        subjectId: result.subjectId,
        date: today,
        duration: result.duration
      });
      const subject = subjects.find(s => s.id === result.subjectId);
      toast({
        title: 'Session saved!',
        description: `${subject?.name}: ${result.duration} minutes logged`
      });
    }
  };

  // Handle manual session entry
  const handleAddManualSession = (subjectId: string, date: string, duration: number) => {
    addSession({
      subjectId,
      date,
      duration
    });
    const subject = subjects.find(s => s.id === subjectId);
    toast({
      title: 'Session added!',
      description: `${subject?.name}: ${duration} minutes on ${format(new Date(date), 'MMM d')}`
    });
  };

  // Handle data export
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Data exported!',
      description: 'Your study data has been downloaded as JSON.'
    });
  };

  // Handle clear all data
  const handleClearAll = () => {
    clearAllData();
    toast({
      title: 'Data cleared',
      description: 'All subjects and sessions have been deleted.'
    });
  };

  // Handle adding a subject
  const handleAddSubject = (name: string, color: any) => {
    addSubject(name, color);
    toast({
      title: 'Subject added!',
      description: `"${name}" is ready to track.`
    });
  };

  // Handle deleting a subject
  const handleDeleteSubject = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    deleteSubject(id);
    toast({
      title: 'Subject deleted',
      description: `"${subject?.name}" and its sessions have been removed.`
    });
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        
      </header>

      {/* Main content */}
      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats row */}
        <StatsCards stats={stats} />

        {/* Chart section */}
        <div className="space-y-4">
          <ChartControls view={chartView} mode={barMode} onViewChange={setChartView} onModeChange={setBarMode} />
          <StudyChart sessions={sessions} subjects={subjects} view={chartView} mode={barMode} />
        </div>

        {/* Controls grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Timer and Manual Entry */}
          <div className="space-y-6">
            <StudyTimer subjects={subjects} isRunning={timer.isRunning} isPaused={timer.isPaused} elapsedTime={timer.elapsedTime} selectedSubjectId={timer.subjectId || timerSubjectId} onStart={handleTimerStart} onPause={timer.pause} onResume={timer.resume} onStop={handleTimerStop} onSubjectSelect={setTimerSubjectId} />
            <ManualEntry subjects={subjects} onAddSession={handleAddManualSession} />
          </div>

          {/* Middle column - Subject Manager */}
          <div>
            <SubjectManager subjects={subjects} onAddSubject={handleAddSubject} onUpdateSubject={updateSubject} onDeleteSubject={handleDeleteSubject} getNextColor={getNextColor} />
          </div>

          {/* Right column - Session History */}
          <div>
            <SessionHistory sessions={sessions} subjects={subjects} onDeleteSession={deleteSession} onExportData={handleExport} onClearAllData={handleClearAll} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-6">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Your data is stored locally in your browser. No account needed.</p>
        </div>
      </footer>
    </div>;
};
export default Index;