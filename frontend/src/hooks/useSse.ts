import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export interface SseEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export const useSse = (onEventReceived?: (event: SseEvent) => void) => {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<SseEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const sseUrl = `${API_BASE}/analytics/stream?token=${encodeURIComponent(token)}`;

    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      console.log('Live SSE stream connected to SmartRation backend');
    };

    es.onerror = (err) => {
      console.warn('SSE stream error/reconnecting...', err);
      setIsConnected(false);
    };

    const handleEvent = (type: string) => (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        const sseEvt: SseEvent = { type, data: parsed, timestamp: new Date() };
        setLastEvent(sseEvt);
        if (onEventReceived) {
          onEventReceived(sseEvt);
        }
      } catch (err) {
        const sseEvt: SseEvent = { type, data: e.data, timestamp: new Date() };
        setLastEvent(sseEvt);
        if (onEventReceived) {
          onEventReceived(sseEvt);
        }
      }
    };

    es.addEventListener('CONNECTED', handleEvent('CONNECTED'));
    es.addEventListener('DISTRIBUTION_COMPLETED', handleEvent('DISTRIBUTION_COMPLETED'));
    es.addEventListener('STOCK_UPDATE', handleEvent('STOCK_UPDATE'));
    es.addEventListener('NOTIFICATION', handleEvent('NOTIFICATION'));
    es.addEventListener('COMPLAINT_SUBMITTED', handleEvent('COMPLAINT_SUBMITTED'));
    es.addEventListener('COMPLAINT_UPDATED', handleEvent('COMPLAINT_UPDATED'));

    return () => {
      es.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  return { isConnected, lastEvent };
};
