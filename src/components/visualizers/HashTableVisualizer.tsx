import React, { useState } from 'react';
import { useHashTable } from '../../hooks/useHashTable';
import { ComplexityMeta } from '../../types/complexity';
import { CollisionStrategy } from '../../types/dataStructures';

interface HashTableVisualizerProps {
  onComplexityChange?: (meta: ComplexityMeta) => void;
}

const hashTableComplexity: ComplexityMeta = {
  name: "Hash Table",
  best: "O(1)",
  average: "O(1)",
  worst: "O(n)",
  description: "Key-value storage using hash function for fast lookups. Collision handling affects worst-case performance."
};

export default function HashTableVisualizer({ onComplexityChange }: HashTableVisualizerProps) {
  const {
    table,
    operation,
    strategy,
    activeIndices,
    probeIndices,
    stepIndex,
    totalSteps,
    currentStep,
    isPlaying,
    speed,
    insert,
    search,
    remove,
    clear,
    play,
    pause,
    step,
    reset,
    setSpeed,
    changeStrategy,
    stats
  } = useHashTable({
    onStatsChange: () => onComplexityChange?.(hashTableComplexity)
  });

  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const handleInsert = () => {
    if (keyInput.trim()) {
      insert(keyInput.trim(), valueInput.trim() || keyInput.trim());
      setKeyInput('');
      setValueInput('');
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      search(searchInput.trim());
    }
  };

  const handleDelete = () => {
    if (searchInput.trim()) {
      remove(searchInput.trim());
      setSearchInput('');
    }
  };

  const getBucketColor = (index: number) => {
    if (activeIndices.includes(index)) {
      if (currentStep?.type === 'hash') return '#3b82f6'; // Blue for hash target
      if (currentStep?.type === 'collision') return '#f59e0b'; // Orange for collision
      if (currentStep?.type === 'insert') return '#10b981'; // Green for insert
      if (currentStep?.type === 'search' && currentStep.found) return '#10b981';
      if (currentStep?.type === 'delete') return '#ef4444'; // Red for delete
      return '#a855f7'; // Purple for probe
    }
    if (probeIndices.includes(index)) {
      return '#6366f1'; // Indigo for probe path
    }
    return 'transparent';
  };

  const strategies: { value: CollisionStrategy; label: string }[] = [
    { value: 'linear-probing', label: 'Linear Probing' },
    { value: 'quadratic-probing', label: 'Quadratic Probing' },
    { value: 'chaining', label: 'Separate Chaining' }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full bg-blue-500/30 px-3 py-1 text-blue-100">Hash Table</span>
        <div className="flex gap-2">
          {strategies.map((s) => (
            <button
              key={s.value}
              onClick={() => changeStrategy(s.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                strategy === s.value
                  ? 'border-blue-400 bg-blue-500/15 text-blue-50'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        {/* Visualizer */}
        <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col min-h-[500px]">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Data Structure: Hash Table ({strategy})</span>
            <span>Operation: {operation || 'Idle'}</span>
          </div>

          <div className="flex-1 bg-[#0b1020] rounded-lg overflow-auto min-h-[400px]">
            <div className="p-4">
              {/* Step info */}
              {currentStep && (
                <div className="mb-4 text-center text-sm text-slate-300">
                  {currentStep.type === 'hash' && `hash("${currentStep.key}") = ${currentStep.hash} → index ${currentStep.index}`}
                  {currentStep.type === 'collision' && `Collision at index ${currentStep.index}! Using ${currentStep.strategy}`}
                  {currentStep.type === 'probe' && `Probing: ${currentStep.indexes.join(' → ')}`}
                  {currentStep.type === 'insert' && `Inserting "${currentStep.key}" at index ${currentStep.index}`}
                  {currentStep.type === 'search' && (currentStep.found ? `Found "${currentStep.key}" at index ${currentStep.index}` : `"${currentStep.key}" not found`)}
                  {currentStep.type === 'delete' && `Deleted "${currentStep.key}" from index ${currentStep.index}`}
                  {currentStep.type === 'done' && `Operation complete: ${currentStep.operation}`}
                </div>
              )}

              {/* Hash Table Visualization */}
              <div className="space-y-2">
              {table.map((entry, index) => (
                <div
                  key={index}
                  className={`flex rounded-lg border transition-all ${
                    activeIndices.includes(index)
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : probeIndices.includes(index)
                      ? 'border-indigo-400 bg-indigo-500/10'
                      : 'border-slate-700 bg-slate-800/30'
                  }`}
                >
                  {/* Color indicator - sits at true left edge as sibling */}
                  <div
                    className="w-1 shrink-0 rounded-l-lg"
                    style={{ backgroundColor: getBucketColor(index) || '#334155' }}
                  />
                  {/* Row content with padding */}
                  <div className="flex-1 flex items-center gap-3 p-2 min-w-0 overflow-hidden">
                    {/* Index */}
                    <div className="w-10 text-center font-mono text-sm text-slate-500 shrink-0">
                      {index}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center gap-2 min-w-0 overflow-x-auto">
                      {entry.status === 'empty' ? (
                        <span className="text-slate-600 text-sm italic">empty</span>
                      ) : entry.status === 'deleted' ? (
                        <span className="text-red-400/50 text-sm italic line-through">deleted</span>
                      ) : (
                        <>
                          {/* First entry */}
                          <div className="flex items-center gap-1 rounded border border-slate-600 bg-slate-800/50 px-2 py-1 shrink-0">
                            <span className="text-sm font-mono text-cyan-300">{entry.key}</span>
                            <span className="text-slate-500">:</span>
                            <span className="text-sm font-mono text-green-300">{entry.value}</span>
                          </div>
                          {/* Chain for separate chaining - render all linked entries */}
                          {(() => {
                            const chainedEntries = [];
                            let current = entry.next;
                            while (current && current.key) {
                              chainedEntries.push(current);
                              current = current.next;
                            }
                            return chainedEntries.map((chainEntry, chainIdx) => (
                              <React.Fragment key={chainIdx}>
                                <span className="text-slate-500 text-lg shrink-0">→</span>
                                <div className="flex items-center gap-1 rounded border border-amber-600/50 bg-amber-900/20 px-2 py-1 shrink-0">
                                  <span className="text-sm font-mono text-cyan-300">{chainEntry.key}</span>
                                  <span className="text-slate-500">:</span>
                                  <span className="text-sm font-mono text-green-300">{chainEntry.value}</span>
                                </div>
                              </React.Fragment>
                            ));
                          })()}
                        </>
                      )}
                    </div>

                    {/* Probe count indicator */}
                    {entry.probeCount !== undefined && entry.probeCount > 0 && (
                      <span className="text-xs text-amber-400 shrink-0">
                        +{entry.probeCount} probes
                      </span>
                    )}
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full md:w-80 rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 tracking-wide">HASH TABLE CONTROLS</h3>

          {/* Insert */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Insert</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Key"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none min-w-0"
              />
              <input
                type="text"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                placeholder="Value"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none min-w-0"
              />
            </div>
            <button
              onClick={handleInsert}
              className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
            >
              Insert
            </button>
          </div>

          {/* Search/Delete */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Search / Delete</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Key"
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

          {/* Statistics */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 space-y-1">
            <h4 className="text-xs font-semibold text-slate-400">Table Statistics</h4>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Entries:</span>
              <span className="text-slate-200">{stats.size}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Load Factor:</span>
              <span className="text-slate-200">{(stats.loadFactor ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Collisions:</span>
              <span className="text-slate-200">{stats.collisions ?? 0}</span>
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
                onClick={isPlaying ? pause : play}
                className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={step}
                disabled={stepIndex >= totalSteps - 1}
                className="flex-1 rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500 disabled:opacity-50"
              >
                Step
              </button>
              <button
                onClick={reset}
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
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Clear */}
          <button
            onClick={clear}
            className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
          >
            Clear Table
          </button>
        </div>
      </div>
    </div>
  );
}
