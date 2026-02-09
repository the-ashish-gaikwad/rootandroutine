import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { APP_VERSION } from '@/lib/constants';
import { MessageSquarePlus } from 'lucide-react';

export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed || trimmed.length > 1000) return;

    setSending(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        message: trimmed,
        app_version: APP_VERSION,
      });
      if (error) throw error;
      toast({ title: 'Thanks!', description: 'Your feedback has been sent.' });
      setMessage('');
      setOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Could not send feedback. Try again later.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-muted-foreground hover:text-foreground">
          <MessageSquarePlus className="w-3.5 h-3.5" />
          Suggest a Feature
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggest a Feature</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="What would make this app better?"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
          rows={4}
        />
        <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
        <Button onClick={handleSubmit} disabled={!message.trim() || sending}>
          {sending ? 'Sending…' : 'Send Feedback'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
