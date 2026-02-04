import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit3 } from 'lucide-react';
import { Subject } from '@/types/study';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ManualEntryProps {
  subjects: Subject[];
  onAddSession: (subjectId: string, date: string, duration: number) => void;
}

export function ManualEntry({ subjects, onAddSession }: ManualEntryProps) {
  const [subjectId, setSubjectId] = useState<string>('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectId) return;
    
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalMinutes = h * 60 + m;
    
    if (totalMinutes <= 0) return;
    
    onAddSession(subjectId, date, totalMinutes);
    
    // Reset form
    setHours('');
    setMinutes('');
  };

  const isValid = subjectId && ((parseInt(hours) || 0) > 0 || (parseInt(minutes) || 0) > 0);

  return (
    <Card className="notebook-shadow border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-handwritten text-2xl">
          <Edit3 className="w-5 h-5 text-primary" />
          Log Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="subject" className="w-full bg-background">
                <SelectValue placeholder="Select subject..." />
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
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="bg-background"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="Hours"
                  value={hours}
                  onChange={(e) => setHours(e.target.value.slice(0, 2))}
                  className="bg-background"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Minutes"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value.slice(0, 2))}
                  className="bg-background"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={!isValid} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Session
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
