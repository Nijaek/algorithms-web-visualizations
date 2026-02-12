"use client";

interface SpeedSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export default function SpeedSlider({
  value,
  onChange,
  min = 10,
  max = 800,
  label = "Speed (ms)",
}: SpeedSliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="font-mono text-cyan-400">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500"
      />
    </div>
  );
}
