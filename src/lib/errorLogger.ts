import { supabase } from '@/integrations/supabase/client';
import { APP_VERSION } from './constants';

export async function logError(error: unknown, context?: string) {
  try {
    const err = error instanceof Error ? error : new Error(String(error));
    await supabase.from('error_logs').insert({
      error_message: err.message?.slice(0, 2000) ?? 'Unknown error',
      error_stack: err.stack?.slice(0, 4000) ?? null,
      context: context ?? null,
      app_version: APP_VERSION,
    });
  } catch {
    // Never let logging break the app
  }
}
