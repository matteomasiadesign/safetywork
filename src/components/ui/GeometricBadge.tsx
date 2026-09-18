import React from "react";

interface GeometricBadgeProps {
  children: React.ReactNode;
  variant?: "cyan" | "orange" | "red" | "slate";
  className?: string;
}

export default function GeometricBadge({
  children,
  variant = "cyan",
  className = "",
}: GeometricBadgeProps) {
  const styles = {
    cyan: "bg-brand-cyan-light text-brand-cyan-dark border-brand-cyan/30",
    orange: "bg-brand-orange-light text-brand-orange-dark border-brand-orange/30",
    red: "bg-brand-red-light text-brand-red border-brand-red/30",
    slate: "bg-white text-slate-900 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md border ${styles[variant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {children}
    </span>
  );
}

