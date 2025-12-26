import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from './useAnalytics';

interface CursorPosition {
  x: number;
  y: number;
  timestamp: number;
  viewportWidth: number;
  viewportHeight: number;
}

// Server-side validated cursor tracking
const trackCursor = async (artworkId: string, sessionId: string, positions: CursorPosition[]) => {
  try {
    const response = await supabase.functions.invoke('track-analytics', {
      body: {
        action: 'track_cursor',
        data: {
          sessionId,
          artworkId,
          positions: positions.map(pos => ({
            x: pos.x,
            y: pos.y,
            viewportWidth: pos.viewportWidth,
            viewportHeight: pos.viewportHeight,
          })),
        },
      },
    });

    if (response.error) {
      console.error('[CursorTracking] Edge function error:', response.error);
    }
  } catch (error) {
    console.error('[CursorTracking] Request error:', error);
  }
};

export const useArtworkCursorTracking = (artworkId: string, enabled: boolean = true) => {
  const { sessionId } = useAnalytics();
  const bufferRef = useRef<CursorPosition[]>([]);
  const lastSendRef = useRef(Date.now());
  const imageRefCallback = useRef<HTMLImageElement | null>(null);

  const sendBuffer = useCallback(async () => {
    if (bufferRef.current.length === 0 || !sessionId || !imageRefCallback.current) return;

    const positionsToSend = [...bufferRef.current];
    bufferRef.current = [];

    await trackCursor(artworkId, sessionId, positionsToSend);
  }, [artworkId, sessionId]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled || !imageRefCallback.current) return;

    const imgElement = imageRefCallback.current;
    const rect = imgElement.getBoundingClientRect();
    
    // Calculate relative position (0-100 range)
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Only track if cursor is within the image bounds
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      bufferRef.current.push({
        x,
        y,
        timestamp: Date.now(),
        viewportWidth: Math.round(rect.width),
        viewportHeight: Math.round(rect.height),
      });

      // Send buffer every 2 seconds
      const now = Date.now();
      if (now - lastSendRef.current > 2000) {
        sendBuffer();
        lastSendRef.current = now;
      }
    }
  }, [enabled, sendBuffer]);

  const registerImageElement = useCallback((element: HTMLImageElement | null) => {
    imageRefCallback.current = element;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Throttled mouse move handler (sample every 100ms)
    let lastTime = 0;
    const throttledHandler = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime > 100) {
        handleMouseMove(e);
        lastTime = now;
      }
    };

    window.addEventListener('mousemove', throttledHandler);

    // Send remaining buffer on unmount
    return () => {
      window.removeEventListener('mousemove', throttledHandler);
      sendBuffer();
    };
  }, [enabled, handleMouseMove, sendBuffer]);

  return { registerImageElement };
};
