"use client";

import Spline from "@splinetool/react-spline";

export function GlobalSplineBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ background: "#05020F" }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
        <Spline
          style={{ width: "100%", height: "100%" }}
          scene="https://prod.spline.design/dJqTIQ-tE3ULUPMi/scene.splinecode"
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            linear-gradient(to right, rgba(0,0,0,0.75), transparent 25%, transparent 75%, rgba(0,0,0,0.75)),
            linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)
          `,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "180px",
          height: "56px",
          background: "#05020F",
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}
