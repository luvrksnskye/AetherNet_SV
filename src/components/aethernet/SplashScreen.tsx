import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const vortexRef = useRef<SVGSVGElement>(null);
  const [phase, setPhase] = useState<'vortex' | 'title' | 'tagline'>('vortex');

  useEffect(() => {
    const vortex = vortexRef.current;
    if (!vortex) return;

    requestAnimationFrame(() => vortex.classList.add('revealed'));

    const fadeTimer = setTimeout(() => {
      gsap.to(vortex, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => setPhase('title'),
      });
    }, 2500);

    const scanSFX = new Audio('/src/sfx/scan-zoom.wav');
    const affirmSFX = new Audio('/src/sfx/affirmation-tech.wav');
    setTimeout(() => scanSFX.play().catch(() => {}), 300);
    setTimeout(() => affirmSFX.play().catch(() => {}), 2800);

    return () => clearTimeout(fadeTimer);
  }, []);

  useEffect(() => {
    if (phase === 'title') {
      gsap.timeline()
        .fromTo(
          '.sv-splash-char',
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.8, ease: 'back.out(1.7)' }
        )
        .call(() => setPhase('tagline'), [], '+=0.1');
    }

    if (phase === 'tagline') {
      gsap.fromTo(
        '.sv-splash-tagline',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          onComplete: () => {
            gsap.to(containerRef.current, {
              opacity: 0,
              duration: 0.8,
              delay: 1,
              onComplete: onComplete,
            });
          },
        }
      );
    }
  }, [phase, onComplete]);

  return (
    <div ref={containerRef} className="sv-splash">
      <svg
        ref={vortexRef}
        className="sv-splash-vortex"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="sv-glow-intense" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="sv-core-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="15" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="sv-vortex-ring" style={{ transformOrigin: '500px 500px' }}>
          <path className="sv-ring-segment sv-seg-1" fill="white" d="M367.84,65.46l91.8,24.6c-27.04,15.57-50.48,38.25-67.21,67.21-15.02,26.02-22.94,54.17-24.37,82.25-2.82,1.62-5.59,3.32-8.32,5.09-25.79,16.74-47.09,39.79-61.76,66.95-14-25.91-21.94-55.57-21.94-87.09,0-33.45,8.94-64.81,24.58-91.81,16.12-27.86,39.36-51.09,67.22-67.19Z" />
          <path className="sv-ring-segment sv-seg-2" fill="white" d="M513.41,74.6c27.89-16.07,59.62-24.57,91.8-24.6l67.22,67.19c-31.2-.04-62.84,7.89-91.81,24.62-25.6,14.78-46.3,34.79-61.51,57.91-1.89-.06-3.79-.09-5.7-.09s-3.81.03-5.7.09c-31.21.95-60.47,9.68-85.88,24.34,1.43-28.08,9.35-56.23,24.37-82.25,16.73-28.97,40.16-51.65,67.21-67.21Z" />
          <path className="sv-ring-segment sv-seg-3" fill="white" d="M777.17,279.26c33.45,0,64.82,8.94,91.83,24.58,27.86,16.12,51.1,39.35,67.21,67.2l-24.6,91.78c-15.57-27.04-38.25-50.47-67.23-67.19-27.38-15.8-57.15-23.75-86.68-24.54-.8-1.6-1.62-3.18-2.47-4.74-14.67-27.16-35.98-50.2-61.76-66.95,25.1-12.89,53.56-20.15,83.7-20.15Z" />
          <path className="sv-ring-segment sv-seg-4" fill="white" d="M771.49,424.8c29.53.79,59.29,8.74,86.68,24.54,28.97,16.72,51.66,40.15,67.23,67.19,16.07,27.88,24.58,59.6,24.6,91.78,0,1.78-.03,3.56-.08,5.34l-67.13,61.86c.04-31.2-7.89-62.82-24.62-91.79-16.72-28.95-40.14-51.63-67.17-67.19-.08-.06-.17-.11-.27-.16.16-3.06.23-6.13.23-9.22,0-29.62-7.01-57.59-19.47-82.36Z" />
          <path className="sv-ring-segment sv-seg-5" fill="white" d="M774.91,744.62c0-33.43-8.93-64.76-24.55-91.75-.92-1.59-1.85-3.17-2.83-4.72,15.79-25.5,25.5-55.14,27.13-86.93.1-.05.19-.1.28-.17,27.04,15.57,50.45,38.25,67.17,67.19,16.73,28.97,24.66,60.59,24.62,91.79-.04,32.18-8.54,63.9-24.61,91.78l-91.8,24.61c15.64-27,24.58-58.36,24.58-91.81Z" />
          <path className="sv-ring-segment sv-seg-6" fill="white" d="M605.22,844.75c16.72-28.95,24.65-60.56,24.62-91.74,0-3.09-.08-6.19-.25-9.27,24.8-14.3,45.95-34.23,61.69-58.03,1.01-1.52,2-3.07,2.96-4.63.97,1.55,1.91,3.13,2.83,4.72,15.62,26.99,24.55,58.33,24.55,91.75s-8.94,64.81-24.58,91.81c-16.12,27.86-39.36,51.09-67.22,67.19l-91.8-24.6c27.04-15.57,50.48-38.25,67.21-67.21Z" />
          <path className="sv-ring-segment sv-seg-7" fill="white" d="M156.75,608.38c28.95,16.71,60.57,24.64,91.76,24.62,1.93,0,3.86-.04,5.78-.09,15.74,23.81,36.89,43.73,61.69,58.03,2.59,1.5,5.21,2.93,7.88,4.29-2.66,1.73-5.37,3.4-8.12,4.98-27,15.61-58.34,24.54-91.77,24.54s-64.82-8.94-91.83-24.58c-27.86-16.12-51.1-39.35-67.21-67.2l24.6-91.78c15.57,27.04,38.25,50.47,67.23,67.19Z" />
          <path className="sv-ring-segment sv-seg-8" fill="white" d="M417.08,858.19c28.95-16.71,51.64-40.13,67.21-67.16,1.81-3.11,3.51-6.28,5.11-9.49,28.26-.77,54.92-7.92,78.59-20.07,2.66-1.36,5.29-2.79,7.88-4.29.17,3.08.25,6.18.25,9.27.03,31.18-7.9,62.79-24.62,91.74-16.73,28.97-40.16,51.65-67.21,67.21-27.89,16.07-59.62,24.57-91.8,24.6l-67.22-67.19c31.2.04,62.84-7.89,91.81-24.62Z" />
          <path className="sv-ring-segment sv-seg-9" fill="white" d="M257.3,777.57c33.43,0,64.78-8.93,91.77-24.54,2.75-1.59,5.46-3.25,8.12-4.98,23.68,12.15,50.34,19.3,78.59,20.07,1.7.05,3.41.07,5.11.07s3.42-.03,5.11-.07c-1.61,3.21-3.3,6.38-5.11,9.49-15.57,27.03-38.25,50.44-67.21,67.16-28.97,16.72-60.61,24.65-91.81,24.62-32.19-.04-63.91-8.54-91.8-24.61l-24.61-91.78c27.01,15.64,58.38,24.58,91.83,24.58Z" />
          <path className="sv-ring-segment sv-seg-10" fill="white" d="M117.21,328.49c-.04,31.2,7.89,62.82,24.62,91.79,16.72,28.95,40.14,51.63,67.17,67.19.09.06.18.12.28.17,1.62,31.78,11.34,61.43,27.13,86.93.95,1.56,1.95,3.1,2.96,4.63-1.93.06-3.86.09-5.78.09-31.19.03-62.8-7.9-91.76-24.62-28.97-16.72-51.66-40.15-67.23-67.19-16.07-27.88-24.58-59.6-24.6-91.78l67.21-67.2Z" />
          <path className="sv-ring-segment sv-seg-11" fill="white" d="M626.26,158.28c28.97-16.72,60.61-24.65,91.81-24.62,32.19.04,63.91,8.54,91.8,24.61l24.61,91.78c-27.01-15.64-58.38-24.58-91.83-24.58-30.15,0-58.61,7.26-83.7,20.15-2.73-1.77-5.5-3.47-8.32-5.09-25.41-14.66-54.67-23.4-85.88-24.34,15.21-23.11,35.9-43.13,61.51-57.91Z" />
          <path className="sv-ring-segment sv-seg-12" fill="white" d="M246.82,167.59c-15.64,27-24.58,58.36-24.58,91.81,0,31.52,7.94,61.18,21.94,87.09-.84,1.56-1.67,3.14-2.47,4.74-12.46,24.76-19.47,52.74-19.47,82.36,0,3.09.07,6.17.23,9.22-.09.05-.18.09-.27.16-27.04-15.57-50.45-38.25-67.17-67.19-16.73-28.97-24.66-60.59-24.62-91.79.04-32.18,8.54-63.9,24.61-91.78l91.8-24.61Z" />
        </g>

        <g className="sv-vortex-bar" style={{ transformOrigin: '500px 500px' }}>
          <ellipse
            fill="rgba(255,255,255,0.9)"
            filter="url(#sv-glow-intense)"
            cx="500"
            cy="500"
            rx="620.77"
            ry="18.12"
            transform="rotate(-40.11 500 500)"
          />
        </g>

        <g className="sv-vortex-core">
          <circle fill="white" filter="url(#sv-core-glow)" cx="500" cy="500" r="100" />
        </g>
      </svg>

      {phase !== 'vortex' && (
        <div className="sv-splash-title-wrap">
          <h1 className="sv-splash-title">
            {'STARVORTEX'.split('').map((char, i) => (
              <span key={i} className="sv-splash-char">
                {char}
              </span>
            ))}
          </h1>
        </div>
      )}

      {phase === 'tagline' && (
        <p className="sv-splash-tagline">ONE FORCE BEHIND TOMORROW'S SYSTEMS</p>
      )}
    </div>
  );
};
