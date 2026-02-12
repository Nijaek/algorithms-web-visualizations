"use client";

interface VisualizationCanvasProps {
  children: React.ReactNode;
  className?: string;
}

export default function VisualizationCanvas({
  children,
  className = "",
}: VisualizationCanvasProps) {
  return (
    <div
      className={`relative w-full flex-1 min-h-0 overflow-hidden rounded-xl border border-white/[0.04] bg-surface-1 p-3 ${className}`}
    >
      {children}
    </div>
  );
}
