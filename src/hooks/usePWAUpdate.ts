import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '@/hooks/use-toast';

export function usePWAUpdate() {
  const { toast } = useToast();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Check for updates every 60 minutes
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast({
        title: 'Update available',
        description: 'A new version is ready. Refreshing…',
        duration: 3000,
      });
      // Auto-refresh after a short delay so the user sees the toast
      const timeout = setTimeout(() => {
        updateServiceWorker(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [needRefresh, updateServiceWorker, toast]);
}
