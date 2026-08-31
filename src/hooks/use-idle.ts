import { useEffect, useRef, useState } from 'react';

const ACTIVITY_EVENTS = [
  'pointerdown',
  'pointermove',
  'keydown',
  'touchstart',
  'wheel',
  'scroll',
] as const;

/**
 * Detecta inatividade global. Qualquer interação zera o timer e
 * encerra a hibernação sem alterar o estado da UI (seção, carrossel, etc.).
 */
export function useIdle(timeoutMs: number): boolean {
  const [isIdle, setIsIdle] = useState(false);
  const isIdleRef = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const scheduleIdle = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        isIdleRef.current = true;
        setIsIdle(true);
      }, timeoutMs);
    };

    const onActivity = () => {
      if (isIdleRef.current) {
        isIdleRef.current = false;
        setIsIdle(false);
      }
      scheduleIdle();
    };

    scheduleIdle();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }

    return () => {
      clearTimeout(timer);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
    };
  }, [timeoutMs]);

  return isIdle;
}
