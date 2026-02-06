import { useEffect, useRef, useCallback } from 'react';

export const useSVCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const cursorX = useRef(0);
  const cursorY = useRef(0);
  const rafId = useRef<number>(0);

  const animate = useCallback(() => {
    const dx = mouseX.current - cursorX.current;
    const dy = mouseY.current - cursorY.current;
    cursorX.current += dx * 0.15;
    cursorY.current += dy * 0.15;

    if (cursorRef.current) {
      cursorRef.current.style.transform =
        `translate3d(${cursorX.current - 60}px, ${cursorY.current - 60}px, 0)`;
    }
    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    };

    const onDown = () => cursorRef.current?.classList.add('click');
    const onUp = () => cursorRef.current?.classList.remove('click');

    const onEnter = () => cursorRef.current?.classList.add('hover');
    const onLeave = () => cursorRef.current?.classList.remove('hover');

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    const observe = () => {
      document.querySelectorAll('button, input, a, [role="button"]').forEach((el) => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };

    observe();
    const observer = new MutationObserver(observe);
    observer.observe(document.body, { childList: true, subtree: true });

    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      observer.disconnect();
      cancelAnimationFrame(rafId.current);
    };
  }, [animate]);

  return cursorRef;
};
