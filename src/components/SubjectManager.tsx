import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Trash2, Palette, BookOpen } from 'lucide-react';
import { Subject, PastelColor, PASTEL_COLORS, colorToClass } from '@/types/study';
import { cn } from '@/lib/utils';

interface SubjectManagerProps {
  subjects: Subject[];
  onAddSubject: (name: string, color: PastelColor) => void;
  onUpdateSubject: (id: string, updates: { name?: string; color?: PastelColor }) => void;
  onDeleteSubject: (id: string) => void;
  getNextColor: () => PastelColor;
}

export function SubjectManager({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  getNextColor,
}: SubjectManagerProps) {
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState<PastelColor>(getNextColor());

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    onAddSubject(newName.trim(), selectedColor);
    setNewName('');
    setSelectedColor(getNextColor());
  };

  return (
    <Card className="notebook-shadow border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-handwritten text-2xl">
          <BookOpen className="w-5 h-5 text-primary" />
          Subjects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new subject */}
        <form onSubmit={handleAddSubject} className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New subject name..."
            maxLength={50}
            className="flex-1 bg-background"
          />
          <Select
            value={selectedColor}
            onValueChange={(v) => setSelectedColor(v as PastelColor)}
          >
            <SelectTrigger className="w-[60px] bg-background">
              <div className={cn('w-4 h-4 rounded-full', colorToClass[selectedColor])} />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              {PASTEL_COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-4 h-4 rounded-full', colorToClass[color])} />
                    <span className="capitalize">{color}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="icon" disabled={!newName.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </form>

        {/* Subject list */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {subjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">
              No subjects yet. Add one above!
            </p>
          ) : (
            subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 group"
              >
                <Select
                  value={subject.color}
                  onValueChange={(color) =>
                    onUpdateSubject(subject.id, { color: color as PastelColor })
                  }
                >
                  <SelectTrigger className="w-8 h-8 p-0 border-0 bg-transparent">
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full mx-auto',
                        colorToClass[subject.color]
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {PASTEL_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div className={cn('w-4 h-4 rounded-full', colorToClass[color])} />
                          <span className="capitalize">{color}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="flex-1 truncate">{subject.name}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                       className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{subject.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will also delete all study sessions for this subject.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteSubject(subject.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
