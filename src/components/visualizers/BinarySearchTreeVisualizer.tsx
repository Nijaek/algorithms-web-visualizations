import React, { useMemo } from 'react';
import { TreeNode, BSTStep } from '../../types/dataStructures';

interface BinarySearchTreeVisualizerProps {
  tree: TreeNode | null;
  currentStep: BSTStep | undefined;
  highlightPath?: number[];
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
// This ensures nodes never overlap and the tree is always compact
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
  // This guarantees left children are always left of parent, right children always right
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
function getNodeColor(node: TreeNode, currentStep: BSTStep | undefined, searchValue: number | null): string {
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
      if (!currentStep.found && node.value === searchValue) {
        return '#ef4444'; // Red if not found
      }
      if (currentStep.path.includes(node.value)) {
        return '#3b82f6'; // Blue for search path
      }
      break;

    case 'highlight':
      if (node.id === currentStep.node.id) {
        return '#a855f7'; // Purple for highlighted node
      }
      break;

    case 'rotate':
      if (node.id === currentStep.node.id || node.id === currentStep.subtree.id) {
        return '#a855f7'; // Purple for rotation
      }
      break;
  }

  return '#64748b'; // Default slate color
}

// Get edge color
function getEdgeColor(fromNode: TreeNode, toNode: TreeNode, currentStep: BSTStep | undefined): string {
  if (!currentStep) return '#475569';

  // Check if this edge is part of the current operation
  if (currentStep.type === 'insert' && currentStep.parent?.id === fromNode.id && currentStep.node.id === toNode.id) {
    return '#10b981'; // Green for new edge
  }

  return '#475569'; // Default gray
}

export default function BinarySearchTreeVisualizer({
  tree,
  currentStep,
  highlightPath = [],
  className = ''
}: BinarySearchTreeVisualizerProps) {
  const { positions: nodePositions, width, height, nodeRadius } = useMemo(() => {
    return calculateTreeLayout(tree);
  }, [tree]);

  // Extract search value from current step if available
  const searchValue = currentStep?.type === 'search' ? currentStep.node.value : null;

  const isActiveNode = (node: TreeNode): boolean => {
    if (!currentStep) return false;
    if (currentStep.type === 'compare') return node.id === currentStep.node.id;
    if ('node' in currentStep && currentStep.node) return currentStep.node.id === node.id;
    return false;
  };

  return (
    <div className={`relative bg-[#0b1020] rounded-lg overflow-hidden min-h-0 ${className}`}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${Math.max(400, height)}`}
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
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
                stroke={getEdgeColor(node, node.left, currentStep)}
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
                stroke={getEdgeColor(node, node.right, currentStep)}
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
              fill={getNodeColor(node, currentStep, searchValue)}
              stroke="#1e293b"
              strokeWidth="2"
              filter={isActiveNode(node) ? 'url(#glow)' : undefined}
              className="transition-all duration-300"
            />
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
          </g>
        ))}

        {/* Show step information */}
        {currentStep && (
          <text x={width / 2} y="30" textAnchor="middle" fill="white" style={{ fontSize: '14px' }}>
            {currentStep.type === 'compare' && `Comparing with ${currentStep.value}`}
            {currentStep.type === 'insert' && `Inserting ${currentStep.node.value}`}
            {currentStep.type === 'delete' && `Deleting node with value ${currentStep.node.value}`}
            {currentStep.type === 'search' && (
              currentStep.found ? `Found ${currentStep.node.value}!` : `Searching for ${currentStep.node.value}...`
            )}
            {currentStep.type === 'highlight' && currentStep.reason}
            {currentStep.type === 'rotate' && `Rotating ${currentStep.direction}`}
            {currentStep.type === 'done' && `Operation complete: ${currentStep.operation}`}
          </text>
        )}

        {/* Show highlight path values */}
        {highlightPath.length > 0 && (
          <text x={width / 2} y={height - 20} textAnchor="middle" fill="#3b82f6" style={{ fontSize: '12px' }}>
            Path: {highlightPath.join(' → ')}
          </text>
        )}
      </svg>
    </div>
  );
}
