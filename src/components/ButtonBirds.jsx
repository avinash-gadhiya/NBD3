import { useEffect, useRef } from 'react';
import { createButtonBirds } from '../lib/buttonBirds.js';

function Bird() {
  return (
    <span className="button-bird" data-phase="away">
      <svg viewBox="0 0 24 24" focusable="false">
        <g transform="translate(1 3)">
          <g className="button-bird-legs"><path d="M10.4 13.6 9.9 16.6M12.4 13.6 12.7 16.6M9.9 16.6h1.7M12.7 16.6h1.7" /></g>
          <g className="button-bird-body">
            <path d="M8.8 9.6 2.4 6.8 3.2 10.2 8.6 12.6Z" />
            <path d="M13.4 5.8C10.3 6.1 7.5 7.8 6.2 10.2 5.8 11 6.2 12 7.1 12.7 8.5 13.8 10.3 14.3 12.2 14.2 16 14 19 11.6 19 8.4 19 7.5 18.7 6.8 18.2 6.2Z" />
            <g className="button-bird-head">
              <circle cx="16" cy="5.9" r="2.75" />
              <path d="M18.4 5 21.3 5.9 18.4 6.9Z" />
              <circle className="button-bird-eye" cx="17.1" cy="5.3" r=".62" />
            </g>
            <path className="button-bird-wing" d="M14.4 7.6C12.2 6.7 8.4 7.4 5.6 9.7c3.2 1.6 7.1 1.3 8.8-2.1Z" />
          </g>
        </g>
      </svg>
    </span>
  );
}

export default function ButtonBirds() {
  const layer = useRef(null);
  useEffect(() => {
    const flock = createButtonBirds(layer.current);
    return () => flock.destroy();
  }, []);

  return <div ref={layer} className="button-birds" aria-hidden="true">{[0, 1, 2].map(index => <Bird key={index} />)}</div>;
}
