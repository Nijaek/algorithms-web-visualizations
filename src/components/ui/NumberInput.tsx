"use client";

import { useState } from "react";

type ButtonVariant = "green" | "blue" | "red" | "amber" | "indigo";

const buttonColors: Record<ButtonVariant, string> = {
  green: "bg-emerald-600/90 hover:bg-emerald-500",
  blue: "bg-blue-600/90 hover:bg-blue-500",
  red: "bg-red-600/90 hover:bg-red-500",
  amber: "bg-amber-600/90 hover:bg-amber-500",
  indigo: "bg-indigo-600/90 hover:bg-indigo-500",
};

interface NumberInputProps {
  label: string;
  buttonLabel: string;
  buttonVariant?: ButtonVariant;
  onSubmit: (value: number) => void;
  placeholder?: string;
}

export default function NumberInput({
  label,
  buttonLabel,
  buttonVariant = "green",
  onSubmit,
  placeholder = "Value",
}: NumberInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const num = parseInt(value);
    if (!isNaN(num)) {
      onSubmit(num);
      setValue("");
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-slate-500">{label}</label>
      <div className="flex gap-1.5">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${buttonColors[buttonVariant]}`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
