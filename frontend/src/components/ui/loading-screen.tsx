"use client";

import React, { useEffect, useRef } from "react";

const INJECTED_STYLES = `
  .opening-loader {
      position: fixed; inset: 0; z-index: 100;
      background: #2A2F55;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.8s ease, visibility 0.8s ease;
  }
  .opening-loader.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }

  .orbit-system {
      position: relative;
      width: 280px;
      height: 280px;
  }
  .deco-arcs {
      position: absolute;
      inset: -10px;
      pointer-events: none;
      animation: arcs-spin 18s linear infinite;
  }
  @keyframes arcs-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
  }
  .earth-wrap {
      position: absolute;
      top: 50%; left: 50%;
      width: 170px; height: 170px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid #1A2C5C;
      background: #7BB8E0;
      filter: drop-shadow(0 10px 18px rgba(0,0,0,0.45));
  }
  .earth-strip {
      position: absolute;
      inset: 0;
      width: 200%;
      height: 100%;
      display: flex;
      animation: earth-roll 11s linear infinite;
  }
  .earth-strip > svg { width: 50%; height: 100%; flex: 0 0 50%; }
  @keyframes earth-roll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
  }
  .earth-shading {
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: 50%;
      background:
          radial-gradient(circle at 72% 75%, rgba(20,40,90,0.45) 0%, transparent 55%),
          radial-gradient(circle at 28% 22%, rgba(255,255,255,0.28) 0%, transparent 40%);
  }
  .top-runner {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 60px; height: 60px;
      transform: translate(-50%, calc(-50% - 100px));
      display: flex; align-items: flex-end; justify-content: center;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));
      z-index: 5;
  }
  .runner-bob {
      animation: runner-bob 0.42s ease-in-out infinite alternate;
      transform-origin: 50% 90%;
  }
  @keyframes runner-bob {
      from { transform: translateY(0) rotate(-3deg); }
      to { transform: translateY(-2px) rotate(3deg); }
  }
  .runner-leg-front { animation: runner-leg-front 0.42s ease-in-out infinite alternate; transform-origin: 22px 22px; }
  .runner-leg-back  { animation: runner-leg-back  0.42s ease-in-out infinite alternate; transform-origin: 22px 22px; }
  .runner-arm-front { animation: runner-arm-front 0.42s ease-in-out infinite alternate; transform-origin: 22px 14px; }
  .runner-arm-back  { animation: runner-arm-back  0.42s ease-in-out infinite alternate; transform-origin: 22px 14px; }
  @keyframes runner-leg-front { from { transform: rotate(-35deg); } to { transform: rotate(25deg); } }
  @keyframes runner-leg-back  { from { transform: rotate(30deg); } to { transform: rotate(-25deg); } }
  @keyframes runner-arm-front { from { transform: rotate(40deg); } to { transform: rotate(-30deg); } }
  @keyframes runner-arm-back  { from { transform: rotate(-35deg); } to { transform: rotate(35deg); } }
  .opening-loader-label {
      letter-spacing: 0.4em;
      font-weight: 700;
      font-size: 11px;
      color: rgba(255,255,255,0.85);
      animation: opening-pulse 1.6s ease-in-out infinite;
  }
  @keyframes opening-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
  }
`;

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      loaderRef.current?.classList.add("is-hidden");
      setTimeout(onComplete, 800); // Wait for fade out animation
    }, 2600);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div ref={loaderRef} className="opening-loader" aria-hidden="true">
        <div className="relative flex flex-col items-center gap-8">
          <div className="orbit-system">
            <svg className="deco-arcs" viewBox="0 0 300 300" fill="none" stroke="#5C6BC0" strokeWidth="3" strokeLinecap="round">
              <path d="M55 150 A95 95 0 0 1 75 95" opacity="0.7" />
              <path d="M245 150 A95 95 0 0 0 225 95" opacity="0.7" />
              <path d="M40 170 A110 110 0 0 1 70 230" opacity="0.5" />
              <path d="M260 170 A110 110 0 0 0 230 230" opacity="0.5" />
              <path d="M70 250 A105 105 0 0 0 230 250" opacity="0.45" />
              <circle cx="150" cy="150" r="118" opacity="0.25" strokeDasharray="2 6" />
            </svg>
            <div className="earth-wrap">
              <div className="earth-strip">
                {[0, 1].map((k) => (
                  <svg key={k} viewBox="0 0 360 200" preserveAspectRatio="none">
                    <g fill="#2E9F3A" stroke="#1A2C5C" strokeWidth="3" strokeLinejoin="round">
                      <path d="M30 60 Q50 50 70 60 Q80 80 75 110 Q70 140 55 150 Q42 144 36 128 Q26 102 30 60 Z" />
                      <path d="M82 50 Q105 40 128 50 Q124 64 104 64 Q88 60 82 50 Z" />
                      <path d="M88 75 Q102 70 114 82 Q108 96 96 96 Q86 90 88 75 Z" />
                      <path d="M132 30 Q188 22 240 35 Q272 48 280 70 Q268 90 220 96 Q176 96 148 88 Q132 78 132 60 Q128 44 132 30 Z" />
                      <path d="M268 60 Q288 64 294 80 Q282 92 266 88 Z" />
                      <path d="M170 96 Q200 96 206 110 Q198 138 184 148 Q174 132 170 112 Z" />
                      <path d="M232 116 Q262 114 274 130 Q258 144 234 140 Z" />
                      <ellipse cx="282" cy="138" rx="10" ry="4" />
                      <ellipse cx="300" cy="146" rx="8" ry="3" />
                      <path d="M292 158 Q322 152 344 168 Q336 184 312 184 Q294 178 292 158 Z" />
                      <ellipse cx="296" cy="64" rx="6" ry="3" />
                      <ellipse cx="300" cy="78" rx="5" ry="2" />
                    </g>
                    <g fill="#1F7A2A" opacity="0.55">
                      <path d="M40 78 Q56 74 66 88 Q56 100 44 92 Z" />
                      <path d="M180 50 Q210 46 240 56 Q220 66 192 60 Z" />
                      <path d="M300 168 Q318 166 332 176 Q318 180 304 176 Z" />
                    </g>
                  </svg>
                ))}
              </div>
              <div className="earth-shading" />
            </div>
            <div className="top-runner">
              <svg className="runner-bob" width="56" height="56" viewBox="0 0 44 44" fill="#fff" aria-hidden="true">
                <circle cx="24" cy="9" r="4" />
                <rect x="20.5" y="12.5" width="6.5" height="11" rx="2.5" transform="rotate(8 24 18)" />
                <g className="runner-arm-back">
                  <rect x="21" y="14" width="3" height="9" rx="1.5" transform="rotate(40 22 18)" />
                </g>
                <g className="runner-arm-front">
                  <rect x="21" y="14" width="3" height="9" rx="1.5" transform="rotate(-25 22 18)" />
                </g>
                <g className="runner-leg-back">
                  <rect x="21" y="22" width="3" height="11" rx="1.5" transform="rotate(30 22 28)" />
                </g>
                <g className="runner-leg-front">
                  <rect x="21" y="22" width="3" height="11" rx="1.5" transform="rotate(-20 22 28)" />
                </g>
              </svg>
            </div>
          </div>
          <span className="opening-loader-label uppercase fredericka-the-great">Loop Atom</span>
        </div>
      </div>
    </>
  );
}