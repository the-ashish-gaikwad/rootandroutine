declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

export function trackEvent(name: string, props?: Record<string, string | number>) {
  try {
    window.plausible?.(name, props ? { props } : undefined);
  } catch {
    // silently ignore – analytics should never break the app
  }
}
