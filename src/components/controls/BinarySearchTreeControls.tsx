import React from 'react';
import { DataStructureStats } from '../../types/dataStructures';

interface BinarySearchTreeControlsProps {
  onInsert: (value: number) => void;
  onSearch: (value: number) => void;
  onDelete: (value: number) => void;
  onBuild: () => void;
  onClear: () => void;
  onValidate: () => void;
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
  className?: string;
}

export default function BinarySearchTreeControls({
  onInsert,
  onSearch,
  onDelete,
  onBuild,
  onClear,
  onValidate,
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
  stats,
  className = ''
}: BinarySearchTreeControlsProps) {
  const [insertValue, setInsertValue] = React.useState('');
  const [searchValue, setSearchValue] = React.useState('');
  const [deleteValue, setDeleteValue] = React.useState('');

  const handleInsert = () => {
    const value = parseInt(insertValue);
    if (!isNaN(value)) {
      onInsert(value);
      setInsertValue('');
    }
  };

  const handleSearch = () => {
    const value = parseInt(searchValue);
    if (!isNaN(value)) {
      onSearch(value);
      setSearchValue('');
    }
  };

  const handleDelete = () => {
    const value = parseInt(deleteValue);
    if (!isNaN(value)) {
      onDelete(value);
      setDeleteValue('');
    }
  };

  const handleBuild = () => {
    // Let the hook generate random values if needed
    onBuild();
  };

  return (
    <div className={`w-full max-w-sm space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200 ${className}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">BST Controls</p>

      {/* Operation inputs */}
      <div className="space-y-3">
        {/* Insert */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Insert</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={insertValue}
              onChange={(e) => setInsertValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
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

        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Search</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Value"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Search
            </button>
          </div>
        </div>

        {/* Delete */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Delete</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={deleteValue}
              onChange={(e) => setDeleteValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleDelete()}
              placeholder="Value"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={handleBuild}
          className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Regenerate
        </button>
        <button
          onClick={onValidate}
          className="flex-1 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-500"
        >
          Validate
        </button>
      </div>

      {/* Tree statistics */}
      <div className="rounded-lg border border-slate-800 bg-slate-800/50 p-3 space-y-1">
        <h3 className="text-xs font-semibold text-slate-400 mb-2">Tree Statistics</h3>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Size:</span>
          <span className="text-slate-300">{stats.size} nodes</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Height:</span>
          <span className="text-slate-300">{stats.height ?? '-'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Max Balance:</span>
          <span className="text-slate-300">{stats.balance ?? '-'}</span>
        </div>
      </div>

      {/* Animation controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Animation</span>
          <span>Step: {stepIndex + 1} / {totalSteps || 1}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={totalSteps === 0}
            className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={onStep}
            disabled={isPlaying || stepIndex >= totalSteps - 1}
            className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500 disabled:opacity-50"
          >
            Step
          </button>
          <button
            onClick={onReset}
            disabled={totalSteps === 0}
            className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Speed control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Speed (ms)</span>
          <span className="text-cyan-400">{speed}</span>
        </div>
        <input
          type="range"
          min={50}
          max={800}
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
      </div>

      {/* Clear button */}
      <button
        onClick={onClear}
        className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
      >
        Clear Tree
      </button>
    </div>
  );
}
