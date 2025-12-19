import React, { useState, useRef, useEffect } from 'react';
import { useRedBlackTree } from '../../hooks/useRedBlackTree';
import { ComplexityMeta } from '../../types/complexity';
import { RBTreeNode } from '../../types/dataStructures';

interface RedBlackTreeVisualizerProps {
  onComplexityChange?: (meta: ComplexityMeta) => void;
}

const rbTreeComplexity: ComplexityMeta = {
  name: "Red-Black Tree",
  best: "O(log n)",
  average: "O(log n)",
  worst: "O(log n)",
  description: "Self-balancing BST using color properties to ensure O(log n) operations."
};

export default function RedBlackTreeVisualizer({ onComplexityChange }: RedBlackTreeVisualizerProps) {
  const {
    tree,
    operation,
    activeNodeId,
    recoloringNodeId,
    rotatingNodeId,
    violationNodeId,
    searchPath,
    stepIndex,
    totalSteps,
    currentStep,
    isPlaying,
    speed,
    insert,
    search,
    deleteNode,
    generateRandom,
    clear,
    play,
    pause,
    step,
    reset,
    setSpeed,
    stats
  } = useRedBlackTree({
    onStatsChange: () => onComplexityChange?.(rbTreeComplexity)
  });

  const [valueInput, setValueInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(400, containerRef.current.clientHeight)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleInsert = () => {
    const value = parseInt(valueInput);
    if (!isNaN(value)) {
      insert(value);
      setValueInput('');
    }
  };

  const handleSearch = () => {
    const value = parseInt(searchInput);
    if (!isNaN(value)) {
      search(value);
    }
  };

  const handleDelete = () => {
    const value = parseInt(searchInput);
    if (!isNaN(value)) {
      deleteNode(value);
      setSearchInput('');
    }
  };

  // Calculate tree layout
  const calculateLayout = (node: RBTreeNode | null, depth: number, left: number, right: number): Map<string, { x: number; y: number }> => {
    const positions = new Map<string, { x: number; y: number }>();
    if (!node) return positions;

    const x = (left + right) / 2;
    const y = depth * 60 + 40;
    positions.set(node.id, { x, y });

    const mid = (left + right) / 2;
    const leftPositions = calculateLayout(node.left, depth + 1, left, mid);
    const rightPositions = calculateLayout(node.right, depth + 1, mid, right);

    leftPositions.forEach((pos, id) => positions.set(id, pos));
    rightPositions.forEach((pos, id) => positions.set(id, pos));

    return positions;
  };

  const positions = calculateLayout(tree, 0, 0, dimensions.width);

  const getNodeStyle = (nodeId: string, color: 'red' | 'black') => {
    const isActive = activeNodeId === nodeId;
    const isRecoloring = recoloringNodeId === nodeId;
    const isRotating = rotatingNodeId === nodeId;
    const isViolation = violationNodeId === nodeId;
    const isInPath = searchPath.includes(nodeId);

    let boxShadow = 'none';
    if (isActive) boxShadow = '0 0 20px rgba(6, 182, 212, 0.7)';
    if (isRecoloring) boxShadow = '0 0 25px rgba(168, 85, 247, 0.8)';
    if (isRotating) boxShadow = '0 0 25px rgba(59, 130, 246, 0.8)';
    if (isViolation) boxShadow = '0 0 25px rgba(245, 158, 11, 0.8)';

    return {
      backgroundColor: color === 'red' ? '#dc2626' : '#1e293b',
      borderColor: color === 'red' ? '#fca5a5' : '#475569',
      boxShadow,
      transform: isActive || isRecoloring || isRotating ? 'scale(1.15)' : 'scale(1)',
      transition: 'all 0.3s ease-in-out',
      outline: isInPath ? '3px solid #06b6d4' : 'none',
      outlineOffset: '2px'
    };
  };

  const renderTree = (node: RBTreeNode | null): React.ReactNode => {
    if (!node) return null;

    const pos = positions.get(node.id);
    if (!pos) return null;

    const parentPos = node.parent ? positions.get(node.parent.id) : null;

    return (
      <React.Fragment key={node.id}>
        {/* Edge to parent */}
        {parentPos && (
          <line
            x1={parentPos.x}
            y1={parentPos.y + 18}
            x2={pos.x}
            y2={pos.y - 18}
            stroke={searchPath.includes(node.id) ? '#06b6d4' : '#475569'}
            strokeWidth={searchPath.includes(node.id) ? 3 : 2}
            className="transition-all duration-300"
          />
        )}
        {/* Node */}
        <g transform={`translate(${pos.x}, ${pos.y})`}>
          <circle
            r="22"
            style={getNodeStyle(node.id, node.color)}
            className="transition-all duration-300"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {node.value}
          </text>
          {/* Color indicator */}
          <text
            y="35"
            textAnchor="middle"
            fill={node.color === 'red' ? '#fca5a5' : '#94a3b8'}
            fontSize="10"
          >
            {node.color.toUpperCase()}
          </text>
        </g>
        {/* Render children */}
        {renderTree(node.left)}
        {renderTree(node.right)}
      </React.Fragment>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full bg-red-500/30 px-3 py-1 text-red-100">Red-Black Tree</span>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-red-600 border border-red-400"></div>
            <span className="text-xs text-slate-400">Red</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500"></div>
            <span className="text-xs text-slate-400">Black</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        {/* Visualizer */}
        <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col min-h-[500px]">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Data Structure: Red-Black Tree</span>
            <span>Operation: {operation || 'Idle'}</span>
          </div>

          <div
            ref={containerRef}
            className="flex-1 bg-[#0b1020] rounded-lg overflow-auto min-h-[400px]"
          >
            {/* Step info */}
            {currentStep && (
              <div className="p-2 text-center text-sm text-slate-300 border-b border-slate-800">
                {currentStep.type === 'compare' && `Comparing ${currentStep.searchValue} with ${currentStep.value} → go ${currentStep.direction}`}
                {currentStep.type === 'insert' && `Inserting ${currentStep.value} as ${currentStep.color} node`}
                {currentStep.type === 'recolor' && `Recoloring node: ${currentStep.fromColor} → ${currentStep.toColor}`}
                {currentStep.type === 'rotate-left' && `Rotating left`}
                {currentStep.type === 'rotate-right' && `Rotating right`}
                {currentStep.type === 'fix-violation' && `Fixing ${currentStep.violationType} violation`}
                {currentStep.type === 'search' && (currentStep.found ? `Found!` : 'Not found')}
                {currentStep.type === 'delete' && `Deleting ${currentStep.value}`}
                {currentStep.type === 'delete-fixup' && `Delete fixup case ${currentStep.case}`}
                {currentStep.type === 'transplant' && `Transplanting nodes`}
                {currentStep.type === 'done' && `Operation complete: ${currentStep.operation}`}
              </div>
            )}

            {/* Tree Visualization */}
            {!tree ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                <span>Empty tree. Insert a node to begin.</span>
              </div>
            ) : (
              <svg
                width={dimensions.width}
                height={Math.max(400, stats.height * 70 + 100)}
                className="mx-auto"
              >
                {renderTree(tree)}
              </svg>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full md:w-80 rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 tracking-wide">RED-BLACK TREE CONTROLS</h3>

          {/* Insert */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Insert</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                placeholder="Value"
                onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-red-500 focus:outline-none"
              />
              <button
                onClick={handleInsert}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
              >
                Insert
              </button>
            </div>
          </div>

          {/* Search / Delete */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Search / Delete</label>
            <input
              type="number"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Value"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-red-500 focus:outline-none"
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
              <span className="text-slate-400">Black Height:</span>
              <span className="text-slate-200">{stats.blackHeight}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Valid:</span>
              <span className={stats.valid ? 'text-green-400' : 'text-red-400'}>
                {stats.valid ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* RB Properties */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">RB Tree Properties</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>1. Every node is red or black</li>
              <li>2. Root is always black</li>
              <li>3. Red nodes have black children</li>
              <li>4. All paths have equal black nodes</li>
            </ul>
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

          {/* Regenerate / Clear */}
          <div className="flex gap-2">
            <button
              onClick={() => generateRandom(10)}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Regenerate
            </button>
            <button
              onClick={clear}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
