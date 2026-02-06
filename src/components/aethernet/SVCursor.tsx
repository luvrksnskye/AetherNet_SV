import { useSVCursor } from '../../hooks/useSVCursor';

export const SVCursor = () => {
  const cursorRef = useSVCursor();

  return (
    <div ref={cursorRef} className="sv-cursor">
      <div className="sv-cursor-inner">
        <svg className="sv-cursor-svg" viewBox="0 0 120 120" width="120" height="120">
          <circle className="sv-cursor-ring" cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          <circle className="sv-cursor-ring-inner" cx="60" cy="60" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
          <circle className="sv-cursor-progress" cx="60" cy="60" r="40" fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="251" strokeDashoffset="251" transform="rotate(-90 60 60)" />
          <line x1="50" y1="60" x2="70" y2="60" stroke="white" strokeWidth="1.5" />
          <line x1="60" y1="50" x2="60" y2="70" stroke="white" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="3" fill="white" />
        </svg>
      </div>
    </div>
  );
};
