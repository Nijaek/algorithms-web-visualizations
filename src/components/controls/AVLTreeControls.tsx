import React, { useState } from 'react';
import { DataStructureStats } from '../../types/dataStructures';

interface AVLTreeControlsProps {
  onInsert: (value: number) => void;
  onSearch: (value: number) => void;
  onDelete: (value: number) => void;
  onBuild: (values?: number[]) => void;
  onClear: () => void;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  stepIndex: number;
  totalSteps: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  operation: string;
  stats: DataStructureStats;
}

export default function AVLTreeControls({
  onInsert,
  onSearch,
  onDelete,
  onBuild,
  onClear,
  isPlaying,
  onPlay,
  onPause,
  onStep,
  onReset,
  stepIndex,
  totalSteps,
  speed,
  onSpeedChange,
  operation,
  stats
}: AVLTreeControlsProps) {
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      onInsert(value);
      setInputValue('');
    }
  };

  const handleSearch = () => {
    const value = parseInt(searchValue);
    if (!isNaN(value)) {
      onSearch(value);
    }
  };

  const handleDelete = () => {
    const value = parseInt(searchValue);
    if (!isNaN(value)) {
      onDelete(value);
      setSearchValue('');
    }
  };

  const handleBuildRandom = () => {
    onBuild();
  };

  return (
    <div className="w-full md:w-80 rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-200 tracking-wide">AVL TREE CONTROLS</h3>

      {/* Insert */}
      <div className="space-y-2">
        <label className="text-xs text-slate-400">Insert Node</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            placeholder="Value"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
          <button
            onClick={handleInsert}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
          >
            Insert
          </button>
        </div>
      </div>

      {/* Search/Delete */}
      <div className="space-y-2">
        <label className="text-xs text-slate-400">Search / Delete</label>
        <input
          type="number"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Value"
          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Search
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Build Random */}
      <button
        onClick={handleBuildRandom}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Regenerate
      </button>

      {/* Statistics */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 space-y-1">
        <h4 className="text-xs font-semibold text-slate-400">Tree Statistics</h4>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Nodes:</span>
          <span className="text-slate-200">{stats.size}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Height:</span>
          <span className="text-slate-200">{stats.height}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Balanced:</span>
          <span className={stats.balance === 0 ? "text-green-400" : "text-red-400"}>
            {stats.balance === 0 ? "Yes" : "No"}
          </span>
        </div>
      </div>

      {/* Animation Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Animation</span>
          <span className="text-xs text-slate-500">Step: {stepIndex + 1} / {totalSteps || 1}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={onStep}
            disabled={stepIndex >= totalSteps - 1}
            className="flex-1 rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500 disabled:opacity-50"
          >
            Step
          </button>
          <button
            onClick={onReset}
            className="flex-1 rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Speed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Speed (ms)</span>
          <span className="text-xs text-cyan-400">{speed}</span>
        </div>
        <input
          type="range"
          min="50"
          max="800"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
      </div>

      {/* Clear */}
      <button
        onClick={onClear}
        className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
      >
        Clear Tree
      </button>
    </div>
  );
}
