 import React from 'react';
 import { format, parseISO } from 'date-fns';
 import { Trash2 } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { ScrollArea } from '@/components/ui/scroll-area';
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
 import { StudySession, Subject, colorToHex, formatDuration } from '@/types/study';
 
 interface RecentSessionsProps {
   sessions: StudySession[];
   subjects: Subject[];
   onDeleteSession: (id: string) => void;
 }
 
 export function RecentSessions({ sessions, subjects, onDeleteSession }: RecentSessionsProps) {
   // Sort sessions by date (newest first) and limit to 8
   const recentSessions = [...sessions]
     .sort((a, b) => {
       const dateCompare = b.date.localeCompare(a.date);
       if (dateCompare !== 0) return dateCompare;
       return b.createdAt.localeCompare(a.createdAt);
     })
     .slice(0, 8);
 
   const getSubject = (subjectId: string) => subjects.find(s => s.id === subjectId);
 
   return (
     <Card>
       <CardHeader className="pb-3">
         <CardTitle className="text-base font-medium">Recent Sessions</CardTitle>
       </CardHeader>
       <CardContent className="pt-0">
         {recentSessions.length === 0 ? (
           <p className="text-sm text-muted-foreground text-center py-4">
             No sessions yet. Start tracking!
           </p>
         ) : (
           <ScrollArea className="h-[200px] pr-3">
             <div className="space-y-2">
               {recentSessions.map((session) => {
                 const subject = getSubject(session.subjectId);
                 if (!subject) return null;
 
                 return (
                   <div
                     key={session.id}
                     className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0"
                   >
                     <div className="flex items-center gap-2 min-w-0 flex-1">
                       <div
                         className="w-2.5 h-2.5 rounded-full shrink-0"
                         style={{ backgroundColor: colorToHex[subject.color] }}
                       />
                       <span className="text-sm font-medium truncate">
                         {subject.name}
                       </span>
                     </div>
                     <div className="flex items-center gap-2 shrink-0">
                       <span className="text-xs text-muted-foreground">
                         {format(parseISO(session.date), 'MMM d')}
                       </span>
                       <span className="text-xs font-medium w-12 text-right">
                         {formatDuration(session.duration)}
                       </span>
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-7 w-7 text-muted-foreground hover:text-destructive"
                           >
                             <Trash2 className="h-3.5 w-3.5" />
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Delete session?</AlertDialogTitle>
                             <AlertDialogDescription>
                               This will remove the {formatDuration(session.duration)} session for "{subject.name}" on {format(parseISO(session.date), 'MMM d, yyyy')}.
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
                   </div>
                 );
               })}
             </div>
           </ScrollArea>
         )}
       </CardContent>
     </Card>
   );
 }