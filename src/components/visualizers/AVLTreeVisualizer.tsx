import React, { useMemo } from 'react';
import { TreeNode, AVLStep } from '../../types/dataStructures';

interface AVLTreeVisualizerProps {
  tree: TreeNode | null;
  currentStep: AVLStep | undefined;
  highlightPath?: number[];
  rotationInfo?: string;
  className?: string;
}

// Calculate tree height
function getTreeHeight(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
}

// Count actual nodes in tree
function countNodes(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

interface TreeDimensions {
  positions: Map<string, TreeNode & { x: number; y: number }>;
  width: number;
  height: number;
  nodeRadius: number;
}

// Calculate node positions using in-order traversal for x-coordinates
function calculateTreeLayout(root: TreeNode | null): TreeDimensions {
  const positions = new Map<string, TreeNode & { x: number; y: number }>();

  if (!root) {
    return { positions, width: 800, height: 400, nodeRadius: 25 };
  }

  const treeHeight = getTreeHeight(root);
  const nodeCount = countNodes(root);

  // Dynamic sizing based on tree dimensions
  const nodeRadius = Math.max(18, Math.min(25, 28 - treeHeight));
  const levelHeight = Math.max(60, Math.min(80, 90 - treeHeight * 5));
  const horizontalSpacing = nodeRadius * 3;

  // First pass: assign x-positions based on in-order traversal
  let xIndex = 0;
  const xPositions = new Map<string, number>();

  function inOrderTraversal(node: TreeNode | null) {
    if (!node) return;
    inOrderTraversal(node.left);
    xPositions.set(node.id, xIndex++);
    inOrderTraversal(node.right);
  }

  inOrderTraversal(root);

  // Calculate the width needed for the tree
  const treeWidth = nodeCount * horizontalSpacing;
  const canvasWidth = Math.max(800, treeWidth + 100);
  const canvasHeight = Math.max(400, treeHeight * levelHeight + 100);

  // Calculate offset to center the tree horizontally
  const startX = (canvasWidth - treeWidth) / 2 + horizontalSpacing / 2;

  // Second pass: assign final positions (centered)
  function assignPositions(node: TreeNode | null, depth: number) {
    if (!node) return;

    const xPos = xPositions.get(node.id)!;
    const x = startX + xPos * horizontalSpacing;
    const y = 50 + depth * levelHeight;

    positions.set(node.id, { ...node, x, y });

    assignPositions(node.left, depth + 1);
    assignPositions(node.right, depth + 1);
  }

  assignPositions(root, 0);

  return { positions, width: canvasWidth, height: canvasHeight, nodeRadius };
}

// Get node color based on current step
function getNodeColor(node: TreeNode, currentStep: AVLStep | undefined): string {
  if (!currentStep) return '#64748b'; // Default slate color

  switch (currentStep.type) {
    case 'compare':
      if (node.id === currentStep.node.id) {
        return '#f59e0b'; // Orange for current comparison
      }
      if (currentStep.path.includes(node.value)) {
        return '#3b82f6'; // Blue for traversal path
      }
      break;

    case 'insert':
      if (node.id === currentStep.node.id) {
        return '#10b981'; // Green for inserted node
      }
      if (currentStep.parent?.id === node.id) {
        return '#3b82f6'; // Blue for parent of inserted node
      }
      break;

    case 'delete':
      if (node.id === currentStep.node.id) {
        return '#ef4444'; // Red for deleted node
      }
      break;

    case 'search':
      if (currentStep.found && node.id === currentStep.node.id) {
        return '#10b981'; // Green if found
      }
      if (currentStep.path.includes(node.value)) {
        return '#3b82f6'; // Blue for search path
      }
      break;

    case 'balance-check':
      if (node.id === currentStep.node.id) {
        return currentStep.needsRotation ? '#f59e0b' : '#10b981'; // Orange if unbalanced, green if balanced
      }
      break;

    case 'rotate-left':
    case 'rotate-right':
      if (node.id === currentStep.node.id || node.id === currentStep.pivot.id) {
        return '#a855f7'; // Purple for rotation nodes
      }
      break;

    case 'rotate-left-right':
    case 'rotate-right-left':
      if (node.id === currentStep.node.id) {
        return '#a855f7'; // Purple for double rotation
      }
      break;

    case 'update-height':
      if (node.id === currentStep.node.id) {
        return '#06b6d4'; // Cyan for height update
      }
      break;

    case 'highlight':
      if (node.id === currentStep.node.id) {
        return '#a855f7'; // Purple for highlighted node
      }
      break;
  }

  return '#64748b'; // Default slate color
}

// Get balance factor color
function getBalanceColor(balance: number | undefined): string {
  if (balance === undefined) return '#64748b';
  if (balance >= -1 && balance <= 1) return '#10b981'; // Green for balanced
  return '#ef4444'; // Red for unbalanced
}

export default function AVLTreeVisualizer({
  tree,
  currentStep,
  highlightPath = [],
  rotationInfo = '',
  className = ''
}: AVLTreeVisualizerProps) {
  const { positions: nodePositions, width, height, nodeRadius } = useMemo(() => {
    return calculateTreeLayout(tree);
  }, [tree]);

  const isActiveNode = (node: TreeNode): boolean => {
    if (!currentStep) return false;
    if ('node' in currentStep && currentStep.node) return currentStep.node.id === node.id;
    return false;
  };

  return (
    <div className={`flex items-center justify-center bg-[#0b1020] rounded-lg overflow-auto min-h-[450px] p-4 ${className}`}>
      <svg
        width="100%"
        height="100%"
        className="w-full h-full"
        viewBox={`0 0 ${width} ${Math.max(400, height)}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="avl-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22d3ee" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* Draw edges */}
        {Array.from(nodePositions.values()).flatMap(node => {
          const edges = [];
          if (node.left && nodePositions.has(node.left.id)) {
            const leftPos = nodePositions.get(node.left.id)!;
            edges.push(
              <line
                key={`edge-${node.id}-${node.left.id}`}
                x1={node.x}
                y1={node.y}
                x2={leftPos.x}
                y2={leftPos.y}
                stroke="#475569"
                strokeWidth="2"
                className="transition-all duration-300"
              />
            );
          }
          if (node.right && nodePositions.has(node.right.id)) {
            const rightPos = nodePositions.get(node.right.id)!;
            edges.push(
              <line
                key={`edge-${node.id}-${node.right.id}`}
                x1={node.x}
                y1={node.y}
                x2={rightPos.x}
                y2={rightPos.y}
                stroke="#475569"
                strokeWidth="2"
                className="transition-all duration-300"
              />
            );
          }
          return edges;
        })}

        {/* Draw nodes */}
        {Array.from(nodePositions.values()).map(node => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              fill={getNodeColor(node, currentStep)}
              stroke="#1e293b"
              strokeWidth="2"
              filter={isActiveNode(node) ? 'url(#avl-glow)' : undefined}
              className="transition-all duration-300"
            />
            {/* Node value */}
            <text
              x={node.x}
              y={node.y + 5}
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
            {/* Balance factor badge */}
            <circle
              cx={node.x + nodeRadius - 2}
              cy={node.y - nodeRadius + 2}
              r="10"
              fill={getBalanceColor(node.balance)}
              stroke="#1e293b"
              strokeWidth="1"
            />
            <text
              x={node.x + nodeRadius - 2}
              y={node.y - nodeRadius + 6}
              textAnchor="middle"
              fill="white"
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                pointerEvents: 'none'
              }}
            >
              {node.balance ?? 0}
            </text>
            {/* Height label */}
            <text
              x={node.x}
              y={node.y + nodeRadius + 14}
              textAnchor="middle"
              fill="#64748b"
              style={{
                fontSize: '9px',
                pointerEvents: 'none'
              }}
            >
              h={node.height ?? 1}
            </text>
          </g>
        ))}

        {/* Show step information */}
        {currentStep && (
          <text x={width / 2} y="25" textAnchor="middle" fill="white" style={{ fontSize: '14px' }}>
            {currentStep.type === 'compare' && `Comparing with ${currentStep.value}`}
            {currentStep.type === 'insert' && `Inserting ${currentStep.node.value}`}
            {currentStep.type === 'delete' && `Deleting node with value ${currentStep.node.value}`}
            {currentStep.type === 'search' && (
              currentStep.found ? `Found ${currentStep.node.value}!` : `Searching for ${currentStep.node.value}...`
            )}
            {currentStep.type === 'balance-check' && (
              currentStep.needsRotation
                ? `Balance factor ${currentStep.balance} - Rotation needed!`
                : `Balance factor ${currentStep.balance} - Balanced`
            )}
            {currentStep.type === 'rotate-left' && 'Performing Left Rotation'}
            {currentStep.type === 'rotate-right' && 'Performing Right Rotation'}
            {currentStep.type === 'rotate-left-right' && 'Performing Left-Right Rotation'}
            {currentStep.type === 'rotate-right-left' && 'Performing Right-Left Rotation'}
            {currentStep.type === 'update-height' && `Updating height: ${currentStep.oldHeight} -> ${currentStep.newHeight}`}
            {currentStep.type === 'highlight' && currentStep.reason}
            {currentStep.type === 'done' && `Operation complete: ${currentStep.operation}`}
          </text>
        )}

        {/* Show rotation info */}
        {rotationInfo && (
          <text x={width / 2} y="45" textAnchor="middle" fill="#a855f7" style={{ fontSize: '12px' }}>
            {rotationInfo}
          </text>
        )}

        {/* Show highlight path values */}
        {highlightPath.length > 0 && (
          <text x={width / 2} y={height - 20} textAnchor="middle" fill="#3b82f6" style={{ fontSize: '12px' }}>
            Path: {highlightPath.join(' -> ')}
          </text>
        )}

        {/* Legend */}
        <g transform={`translate(${width - 120}, 60)`}>
          <text x="0" y="0" fill="#64748b" style={{ fontSize: '10px' }}>Legend:</text>
          <circle cx="10" cy="15" r="6" fill="#10b981" />
          <text x="22" y="18" fill="#64748b" style={{ fontSize: '9px' }}>Balanced</text>
          <circle cx="10" cy="30" r="6" fill="#ef4444" />
          <text x="22" y="33" fill="#64748b" style={{ fontSize: '9px' }}>Unbalanced</text>
          <circle cx="10" cy="45" r="6" fill="#a855f7" />
          <text x="22" y="48" fill="#64748b" style={{ fontSize: '9px' }}>Rotating</text>
        </g>
      </svg>
    </div>
  );
}
