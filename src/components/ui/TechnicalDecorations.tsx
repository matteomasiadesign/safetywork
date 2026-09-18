import React from "react";

interface CadCompassSchematicProps {
  className?: string;
  size?: number;
}

/**
 * CAD Compass & Drafting Schematic SVG
 * Renders an authentic engineering drafting compass with concentric calibration rings,
 * radial degree ticks, crosshairs, and measurement arcs in brand colors (#008e97 & #f58220).
 */
export function CadCompassSchematic({
  className = "",
  size = 500,
}: CadCompassSchematicProps) {
  return null;
}

/**
 * Technical Corner Registration Mark
 */
export function TechCornerMarks({
  className = "",
  size = 14,
  color = "#cbd5e1",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return null;
}

/**
 * Precision Crosshair Indicator
 */
export function TechCrosshair({
  label,
  coord,
  className = "",
}: {
  label?: string;
  coord?: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-600 select-none ${className}`}
      aria-hidden="true"
    >
      <div className="relative w-3.5 h-3.5 flex items-center justify-center">
        <span className="absolute w-full h-[1px] bg-[#008e97]/50" />
        <span className="absolute h-full w-[1px] bg-[#008e97]/50" />
        <span className="w-1 h-1 rounded-full bg-[#df0000]" />
      </div>
      {label && <span className="text-slate-900 font-semibold">{label}</span>}
      {coord && <span className="text-slate-600 font-normal">[{coord}]</span>}
    </div>
  );
}

/**
 * Millimeter CAD Ruler Strip
 */
export function TechRulerStrip({
  scale = "SCALE 1:1 • METRIC UNIT (mm) • ISO-45001",
  className = "",
}: {
  scale?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full overflow-hidden flex items-center justify-between py-1 px-4 border-y border-[#008e97]/15 bg-white/70 backdrop-blur-xs select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-1 font-mono text-[9px] text-slate-600 tracking-wider">
        <span className="w-1.5 h-1.5 bg-[#008e97] rounded-full inline-block mr-1" />
        <span>{scale}</span>
      </div>

      {/* Graphical Ruler Ticks */}
      <div className="hidden sm:flex items-center space-x-1.5 opacity-60">
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((val) => (
          <div key={val} className="flex items-end space-x-0.5">
            <span className="w-[1px] h-3 bg-[#008e97]" />
            <span className="w-[1px] h-1.5 bg-white" />
            <span className="w-[1px] h-1.5 bg-white" />
            <span className="w-[1px] h-1.5 bg-white" />
            <span className="font-mono text-[8px] text-slate-600 ml-0.5">{val}</span>
          </div>
        ))}
      </div>

      <div className="font-mono text-[9px] text-[#f58220] font-semibold tracking-widest uppercase">
        REF: DLGS-81/08
      </div>
    </div>
  );
}

/**
 * Engineering Dimension Line (e.g. |<-- 100% CONFORMITÀ -->|)
 */
export function TechDimensionGuide({
  label,
  sublabel,
  className = "",
  color = "cyan",
}: {
  label: string;
  sublabel?: string;
  className?: string;
  color?: "cyan" | "orange" | "red";
}) {
  const colorMap = {
    cyan: {
      line: "border-[#008e97]/40",
      text: "text-slate-900",
      bg: "bg-[#e6f6f7]",
    },
    orange: {
      line: "border-[#f58220]/40",
      text: "text-[#f58220]",
      bg: "bg-[#fff4ea]",
    },
    red: {
      line: "border-[#df0000]/40",
      text: "text-[#df0000]",
      bg: "bg-[#fdf2f2]",
    },
  }[color];

  return (
    <div
      className={`relative flex items-center justify-center my-4 select-none ${className}`}
      aria-hidden="true"
    >
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-4 border-l-2 border-y-0 ${colorMap.line}`} />
      <div className={`w-full border-t border-dashed ${colorMap.line}`} />
      <div
        className={`relative z-10 px-3 py-1 font-mono text-[10px] sm:text-xs font-bold tracking-wider uppercase rounded-full ${colorMap.bg} ${colorMap.text} shadow-xs whitespace-nowrap flex items-center gap-2`}
      >
        <span>◀</span>
        <span>{label}</span>
        {sublabel && (
          <span className="opacity-70 text-[9px] font-normal">[{sublabel}]</span>
        )}
        <span>▶</span>
      </div>
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-4 border-r-2 border-y-0 ${colorMap.line}`} />
    </div>
  );
}

