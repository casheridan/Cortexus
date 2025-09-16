import { useCallback, useEffect, useRef } from 'react';

// Custom hook for handling drag operations
export function useDrag(onDrag: (dx: number, dy: number) => void, onEnd?: () => void) {
  const draggingRef = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    draggingRef.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.((e as any).pointerId);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingRef.current || !lastPos.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    onDrag(dx, dy);
  }, [onDrag]);

  const onMouseUp = useCallback(() => {
    if (draggingRef.current) {
      draggingRef.current = false;
      lastPos.current = null;
      onEnd?.();
    }
  }, [onEnd]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return { onMouseDown };
}
