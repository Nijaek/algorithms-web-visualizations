import React, { useState, useMemo } from 'react';
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

  // Calculate tree height
  const getTreeHeight = (node: RBTreeNode | null): number => {
    if (!node) return 0;
    return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
  };

  // Count nodes in tree
  const countNodes = (node: RBTreeNode | null): number => {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  };

  // Calculate tree layout using in-order traversal (same as BST/AVL)
  const { positions, width, height, nodeRadius } = useMemo(() => {
    const positionsMap = new Map<string, { x: number; y: number }>();

    if (!tree) {
      return { positions: positionsMap, width: 800, height: 400, nodeRadius: 25 };
    }

    const treeHeight = getTreeHeight(tree);
    const nodeCount = countNodes(tree);

    // Dynamic sizing based on tree dimensions (same as BST/AVL)
    const radius = Math.max(18, Math.min(25, 28 - treeHeight));
    const levelHeight = Math.max(60, Math.min(80, 90 - treeHeight * 5));
    const horizontalSpacing = radius * 3;

    // First pass: assign x-positions based on in-order traversal
    let xIndex = 0;
    const xPositions = new Map<string, number>();

    const inOrderTraversal = (node: RBTreeNode | null) => {
      if (!node) return;
      inOrderTraversal(node.left);
      xPositions.set(node.id, xIndex++);
      inOrderTraversal(node.right);
    };

    inOrderTraversal(tree);

    // Calculate the width needed for the tree
    const treeWidth = nodeCount * horizontalSpacing;
    const canvasWidth = Math.max(800, treeWidth + 100);
    const canvasHeight = Math.max(400, treeHeight * levelHeight + 100);

    // Calculate offset to center the tree horizontally
    const startX = (canvasWidth - treeWidth) / 2 + horizontalSpacing / 2;

    // Second pass: assign final positions
    const assignPositions = (node: RBTreeNode | null, depth: number) => {
      if (!node) return;

      const xPos = xPositions.get(node.id)!;
      const x = startX + xPos * horizontalSpacing;
      const y = 50 + depth * levelHeight;

      positionsMap.set(node.id, { x, y });

      assignPositions(node.left, depth + 1);
      assignPositions(node.right, depth + 1);
    };

    assignPositions(tree, 0);

    return { positions: positionsMap, width: canvasWidth, height: canvasHeight, nodeRadius: radius };
  }, [tree]);

  // Check if node should have glow effect (consistent with BST/AVL)
  const shouldGlow = (nodeId: string): boolean => {
    return activeNodeId === nodeId ||
           recoloringNodeId === nodeId ||
           rotatingNodeId === nodeId ||
           violationNodeId === nodeId;
  };

  // Get edge color based on path (consistent with BST/AVL)
  const getEdgeColor = (nodeId: string): string => {
    if (searchPath.includes(nodeId)) return '#3b82f6'; // Blue for path
    return '#475569'; // Default gray
  };

  // Collect all nodes for rendering (like BST/AVL approach)
  const collectNodes = (node: RBTreeNode | null): RBTreeNode[] => {
    if (!node) return [];
    return [node, ...collectNodes(node.left), ...collectNodes(node.right)];
  };

  const allNodes = useMemo(() => collectNodes(tree), [tree]);

  return (
    <div className="flex flex-col gap-3 md:flex-row flex-1 min-h-0">
      {/* Visualizer */}
      <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col min-h-0">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>Data Structure: Red-Black Tree</span>
          <span>Operation: {operation || 'Idle'}</span>
        </div>

        <div className="flex-1 flex items-center justify-center bg-[#0b1020] rounded-lg overflow-auto p-4">
            <svg
              width="100%"
              height="100%"
              className="w-full h-full"
              viewBox={`0 0 ${width} ${Math.max(400, height)}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22d3ee" floodOpacity="0.65" />
                </filter>
              </defs>

              {/* Draw edges (like BST/AVL) */}
              {allNodes.map(node => {
                const pos = positions.get(node.id);
                if (!pos) return null;
                const edges = [];

                if (node.left) {
                  const leftPos = positions.get(node.left.id);
                  if (leftPos) {
                    edges.push(
                      <line
                        key={`edge-${node.id}-${node.left.id}`}
                        x1={pos.x}
                        y1={pos.y}
                        x2={leftPos.x}
                        y2={leftPos.y}
                        stroke={getEdgeColor(node.left.id)}
                        strokeWidth="2"
                        className="transition-all duration-300"
                      />
                    );
                  }
                }

                if (node.right) {
                  const rightPos = positions.get(node.right.id);
                  if (rightPos) {
                    edges.push(
                      <line
                        key={`edge-${node.id}-${node.right.id}`}
                        x1={pos.x}
                        y1={pos.y}
                        x2={rightPos.x}
                        y2={rightPos.y}
                        stroke={getEdgeColor(node.right.id)}
                        strokeWidth="2"
                        className="transition-all duration-300"
                      />
                    );
                  }
                }

                return edges;
              })}

              {/* Draw nodes (like BST/AVL) */}
              {allNodes.map(node => {
                const pos = positions.get(node.id);
                if (!pos) return null;

                const hasGlow = shouldGlow(node.id);

                return (
                  <g key={node.id}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius}
                      fill={node.color === 'red' ? '#dc2626' : '#1e293b'}
                      stroke="#1e293b"
                      strokeWidth="2"
                      filter={hasGlow ? 'url(#glow)' : undefined}
                      className="transition-all duration-300"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 5}
                      textAnchor="middle"
                      fill="white"
                      style={{
                        fontSize: `${Math.max(12, nodeRadius * 0.7)}px`,
                        fontWeight: 'bold',
                        pointerEvents: 'none'
                      }}
                    >
                      {node.value}
                    </text>
                    {/* Color indicator below node */}
                    <text
                      x={pos.x}
                      y={pos.y + nodeRadius + 14}
                      textAnchor="middle"
                      fill={node.color === 'red' ? '#fca5a5' : '#94a3b8'}
                      style={{
                        fontSize: '9px',
                        pointerEvents: 'none'
                      }}
                    >
                      {node.color.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* Show step information */}
              {currentStep && (
                <text x={width / 2} y="25" textAnchor="middle" fill="white" style={{ fontSize: '14px' }}>
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
                </text>
              )}
            </svg>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4 min-h-0 max-h-full overflow-y-auto">
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
  );
}
