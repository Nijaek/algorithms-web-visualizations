"use client";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  canStep?: boolean;
  canReset?: boolean;
  stepLabel?: string;
  totalSteps?: number;
  currentStep?: number;
}

export default function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onStep,
  onReset,
  canStep = true,
  canReset = true,
  totalSteps,
  currentStep,
}: PlaybackControlsProps) {
  return (
    <div className="space-y-2">
      {totalSteps !== undefined && currentStep !== undefined && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Animation</span>
          <span className="font-mono text-slate-400">
            {currentStep + 1} / {totalSteps || 1}
          </span>
        </div>
      )}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          className="flex-1 rounded-lg bg-cyan-600/90 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={onStep}
          disabled={!canStep || isPlaying}
          className="flex-1 rounded-lg bg-white/[0.06] px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.1] disabled:opacity-40 disabled:pointer-events-none"
        >
          Step
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={!canReset}
          className="flex-1 rounded-lg bg-white/[0.06] px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.1] disabled:opacity-40 disabled:pointer-events-none"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
