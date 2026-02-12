"use client";

import NeonBadge from "./NeonBadge";

type AccentColor = "fuchsia" | "cyan" | "green" | "purple" | "amber";

interface VisualizerLayoutProps {
  /** Category badge label */
  badge: string;
  /** Badge accent color */
  badgeColor: AccentColor;
  /** Algorithm selector pills - rendered above the visualization */
  pills?: React.ReactNode;
  /** Info bar between pills and canvas */
  infoBar?: React.ReactNode;
  /** Main visualization content */
  children: React.ReactNode;
  /** Right-side control panel content */
  controls: React.ReactNode;
}

export default function VisualizerLayout({
  badge,
  badgeColor,
  pills,
  infoBar,
  children,
  controls,
}: VisualizerLayoutProps) {
  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header row: badge + pills */}
      <div className="flex flex-wrap items-center gap-3">
        <NeonBadge label={badge} color={badgeColor} />
        {pills}
      </div>

      {/* Main content: visualization + control panel */}
      <div className="flex flex-1 flex-col gap-3 md:flex-row min-h-0">
        {/* Left: visualization area */}
        <div className="flex flex-1 flex-col gap-2 min-h-0">
          {infoBar}
          {children}
        </div>

        {/* Right: controls */}
        <div className="min-h-0 md:max-h-full">
          {controls}
        </div>
      </div>
    </div>
  );
}
