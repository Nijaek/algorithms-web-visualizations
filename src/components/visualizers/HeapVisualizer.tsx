import React, { useMemo, useState } from 'react';
import { useHeap } from '../../hooks/useHeap';
import { ComplexityMeta } from '../../types/complexity';

interface HeapVisualizerProps {
  onComplexityChange?: (meta: ComplexityMeta) => void;
}

const heapComplexity: ComplexityMeta = {
  name: "Max Heap",
  best: "O(1)",
  average: "O(log n)",
  worst: "O(log n)",
  description: "A complete binary tree where each parent is greater than its children. Efficient for priority queue operations."
};

export default function HeapVisualizer({ onComplexityChange }: HeapVisualizerProps) {
  const {
    heap,
    operation,
    activeIndices,
    stepIndex,
    totalSteps,
    currentStep,
    isPlaying,
    speed,
    insert,
    extractMax,
    build,
    clear,
    play,
    pause,
    step,
    reset,
    setSpeed,
    stats
  } = useHeap({
    onStatsChange: () => onComplexityChange?.(heapComplexity)
  });

  const [inputValue, setInputValue] = useState('');

  // Calculate tree layout positions for heap visualization
  const treeLayout = useMemo(() => {
    if (heap.length === 0) return { nodes: [], edges: [], width: 800, height: 300 };

    const nodes: { x: number; y: number; value: number; index: number }[] = [];
    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];

    const height = Math.floor(Math.log2(heap.length)) + 1;
    const levelHeight = 70;
    const width = Math.max(800, Math.pow(2, height - 1) * 80);

    for (let i = 0; i < heap.length; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const posInLevel = i - Math.pow(2, level) + 1;
      const nodesInLevel = Math.pow(2, level);
      const spacing = width / (nodesInLevel + 1);

      const x = spacing * (posInLevel + 1);
      const y = 50 + level * levelHeight;

      nodes.push({ x, y, value: heap[i], index: i });

      // Add edge to parent
      if (i > 0) {
        const parentIndex = Math.floor((i - 1) / 2);
        const parentLevel = Math.floor(Math.log2(parentIndex + 1));
        const parentPosInLevel = parentIndex - Math.pow(2, parentLevel) + 1;
        const parentNodesInLevel = Math.pow(2, parentLevel);
        const parentSpacing = width / (parentNodesInLevel + 1);

        const px = parentSpacing * (parentPosInLevel + 1);
        const py = 50 + parentLevel * levelHeight;

        edges.push({ x1: px, y1: py, x2: x, y2: y });
      }
    }

    return { nodes, edges, width, height: 50 + height * levelHeight + 50 };
  }, [heap]);

  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      insert(value);
      setInputValue('');
    }
  };

  const getNodeColor = (index: number) => {
    if (activeIndices.includes(index)) {
      if (currentStep?.type === 'swap') return '#f59e0b'; // Orange for swap
      if (currentStep?.type === 'compare') return '#3b82f6'; // Blue for compare
      if (currentStep?.type === 'extract') return '#ef4444'; // Red for extract
      return '#10b981'; // Green for insert/heapify
    }
    return '#64748b'; // Default slate
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full bg-green-500/30 px-3 py-1 text-green-100">Heap</span>
        <span className="rounded-full border border-green-400 bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-50">
          Max Heap
        </span>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        {/* Visualizer */}
        <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col min-h-[500px]">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Data Structure: Max Heap</span>
            <span>Operation: {operation || 'Idle'}</span>
          </div>

          <div className="flex-1 bg-[#0b1020] rounded-lg overflow-auto min-h-[400px] p-4">
            {/* Tree View */}
            <svg
              width="100%"
              height={Math.max(300, treeLayout.height)}
              viewBox={`0 0 ${treeLayout.width} ${treeLayout.height}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Edges */}
              {treeLayout.edges.map((edge, i) => (
                <line
                  key={`edge-${i}`}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="#475569"
                  strokeWidth="2"
                />
              ))}

              {/* Nodes */}
              {treeLayout.nodes.map((node) => (
                <g key={node.index}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="22"
                    fill={getNodeColor(node.index)}
                    stroke="#1e293b"
                    strokeWidth="2"
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {node.value}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 35}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                  >
                    [{node.index}]
                  </text>
                </g>
              ))}

              {/* Step info */}
              {currentStep && (
                <text x={treeLayout.width / 2} y="25" textAnchor="middle" fill="white" fontSize="14">
                  {currentStep.type === 'compare' && `Comparing indices ${currentStep.index1} and ${currentStep.index2}`}
                  {currentStep.type === 'swap' && `Swapping indices ${currentStep.index1} and ${currentStep.index2}`}
                  {currentStep.type === 'insert' && `Inserting ${currentStep.value}`}
                  {currentStep.type === 'extract' && `Extracting max: ${currentStep.value}`}
                  {currentStep.type === 'heapify' && `Heapifying at index ${currentStep.index}`}
                  {currentStep.type === 'done' && `Operation complete: ${currentStep.operation}`}
                </text>
              )}
            </svg>

            {/* Array View */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {heap.map((value, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 flex items-center justify-center rounded border-2 font-mono text-sm ${
                    activeIndices.includes(index)
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                      : 'border-slate-600 bg-slate-800/50 text-slate-300'
                  }`}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full md:w-80 rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 tracking-wide">HEAP CONTROLS</h3>

          {/* Insert */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Insert</label>
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

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={extractMax}
              disabled={heap.length === 0}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              Extract Max
            </button>
            <button
              onClick={() => build()}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Regenerate
            </button>
          </div>

          {/* Statistics */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 space-y-1">
            <h4 className="text-xs font-semibold text-slate-400">Heap Statistics</h4>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Size:</span>
              <span className="text-slate-200">{stats.size} nodes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Height:</span>
              <span className="text-slate-200">{stats.height}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Max:</span>
              <span className="text-slate-200">{heap.length > 0 ? heap[0] : '-'}</span>
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
            Clear Heap
          </button>
        </div>
      </div>
    </div>
  );
}
