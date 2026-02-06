import { useEffect, useRef } from 'react';
import './CustomCursor.css';

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    if (!cursor || !cursorDot) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Dot sigue inmediatamente
      dotX = mouseX;
      dotY = mouseY;
      cursorDot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
    };
    
    const animate = () => {
      // Cursor con retraso suave
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      cursorX += dx * 0.15;
      cursorY += dy * 0.15;
      
      cursor.style.transform = `translate(${cursorX - 16}px, ${cursorY - 16}px)`;
      
      requestAnimationFrame(animate);
    };
    
    const handleMouseDown = () => {
      cursor.classList.add('sv-cursor-click');
      cursorDot.classList.add('sv-cursor-click');
    };
    
    const handleMouseUp = () => {
      cursor.classList.remove('sv-cursor-click');
      cursorDot.classList.remove('sv-cursor-click');
    };
    
    const handleMouseEnterInteractive = () => {
      cursor.classList.add('sv-cursor-hover');
      cursorDot.classList.add('sv-cursor-hover');
    };
    
    const handleMouseLeaveInteractive = () => {
      cursor.classList.remove('sv-cursor-hover');
      cursorDot.classList.remove('sv-cursor-hover');
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Detectar elementos interactivos
    const interactiveElements = document.querySelectorAll('a, button, input, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnterInteractive);
      el.addEventListener('mouseleave', handleMouseLeaveInteractive);
    });
    
    animate();
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnterInteractive);
        el.removeEventListener('mouseleave', handleMouseLeaveInteractive);
      });
    };
  }, []);
  
  return (
    <>
      <div ref={cursorRef} className="sv-custom-cursor" />
      <div ref={cursorDotRef} className="sv-custom-cursor-dot" />
    </>
  );
};
