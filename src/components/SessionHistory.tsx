import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Trash2, History, Clock } from 'lucide-react';
import { StudySession, Subject, formatDuration, colorToClass } from '@/types/study';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface SessionHistoryProps {
  sessions: StudySession[];
  subjects: Subject[];
  onDeleteSession: (id: string) => void;
  onExportData: () => void;
  onClearAllData: () => void;
}

export function SessionHistory({
  sessions,
  subjects,
  onDeleteSession,
  onExportData,
  onClearAllData,
}: SessionHistoryProps) {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  const handleExport = () => {
    onExportData();
  };

  return (
    <Card className="notebook-shadow border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-handwritten text-2xl">
            <History className="w-5 h-5 text-primary" />
            Session History
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={sessions.length === 0}
              className="gap-1"
            >
              <Download className="w-3 h-3" />
              Export
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sessions.length === 0}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all subjects and study sessions. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onClearAllData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {sortedSessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No study sessions yet.</p>
              <p className="text-sm">Start the timer or log a session!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSessions.map((session) => {
                const subject = getSubject(session.subjectId);
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 group"
                  >
                    {subject && (
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full flex-shrink-0',
                          colorToClass[subject.color]
                        )}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {subject?.name || 'Unknown Subject'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(session.date), 'MMM d, yyyy')} •{' '}
                        {formatDuration(session.duration)}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove this study session from your history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteSession(session.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
