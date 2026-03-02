import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!pass.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: { password: pass },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: 'Access denied', variant: 'destructive' });
        setLoading(false);
        return;
      }
      setErrors(data.errors ?? []);
      setFeedbacks(data.feedbacks ?? []);
      setAuthed(true);
    } catch {
      toast({ title: 'Access denied', variant: 'destructive' });
    }
    setLoading(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader><CardTitle>Admin Access</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? 'Verifying…' : 'Enter'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <Card>
        <CardHeader><CardTitle>Recent Errors ({errors.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {errors.length === 0 && <p className="text-muted-foreground text-sm">No errors logged yet.</p>}
          {errors.map((e: any) => (
            <div key={e.id} className="border rounded p-2 text-xs space-y-1">
              <div className="font-medium text-destructive">{e.error_message}</div>
              <div className="text-muted-foreground">{e.context} · v{e.app_version} · {new Date(e.created_at).toLocaleString()}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Feedback ({feedbacks.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {feedbacks.length === 0 && <p className="text-muted-foreground text-sm">No feedback yet.</p>}
          {feedbacks.map((f: any) => (
            <div key={f.id} className="border rounded p-2 text-xs space-y-1">
              <div>{f.message}</div>
              <div className="text-muted-foreground">v{f.app_version} · {new Date(f.created_at).toLocaleString()}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
