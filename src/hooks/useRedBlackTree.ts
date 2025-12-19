import { useState, useEffect, useRef, useCallback } from 'react';
import { RBTreeNode, RBTreeStep, NodeColor } from '../types/dataStructures';
import {
  createRBNode,
  rbInsert,
  rbSearch,
  rbDelete,
  cloneRBTree,
  inOrderTraversal,
  validateRBTree,
  calculateRBTreeLayout
} from '../algorithms/datastructures/redBlackTree';

interface UseRedBlackTreeProps {
  onStatsChange?: (stats: RBTreeStats) => void;
}

export interface RBTreeStats {
  size: number;
  height: number;
  blackHeight: number;
  valid: boolean;
}

// Helper function for synchronous RB insertion (for initialization)
function rbInsertSync(root: RBTreeNode | null, value: number): RBTreeNode {
  // Simplified insert - just does BST insert with proper coloring
  // For initialization only, not animation
  const newNode = createRBNode(value, 'red');

  if (!root) {
    newNode.color = 'black';
    return newNode;
  }

  let current: RBTreeNode | null = root;
  let parent: RBTreeNode | null = null;

  while (current) {
    parent = current;
    if (value < current.value) {
      current = current.left;
    } else if (value > current.value) {
      current = current.right;
    } else {
      return root; // Duplicate
    }
  }

  newNode.parent = parent;
  if (value < parent!.value) {
    parent!.left = newNode;
  } else {
    parent!.right = newNode;
  }

  // Fix violations
  let node = newNode;
  while (node.parent && node.parent.color === 'red') {
    const grandparent = node.parent.parent;
    if (!grandparent) break;

    const uncle = node.parent === grandparent.left ? grandparent.right : grandparent.left;

    if (uncle && uncle.color === 'red') {
      node.parent.color = 'black';
      uncle.color = 'black';
      grandparent.color = 'red';
      node = grandparent;
    } else {
      if (node.parent === grandparent.left) {
        if (node === node.parent.right) {
          node = node.parent;
          root = rotateLeftSync(root, node);
        }
        node.parent!.color = 'black';
        grandparent.color = 'red';
        root = rotateRightSync(root, grandparent);
      } else {
        if (node === node.parent.left) {
          node = node.parent;
          root = rotateRightSync(root, node);
        }
        node.parent!.color = 'black';
        grandparent.color = 'red';
        root = rotateLeftSync(root, grandparent);
      }
    }
  }

  root.color = 'black';
  return root;
}

function rotateLeftSync(root: RBTreeNode, node: RBTreeNode): RBTreeNode {
  const rightChild = node.right!;
  node.right = rightChild.left;
  if (rightChild.left) rightChild.left.parent = node;
  rightChild.parent = node.parent;
  if (!node.parent) {
    root = rightChild;
  } else if (node === node.parent.left) {
    node.parent.left = rightChild;
  } else {
    node.parent.right = rightChild;
  }
  rightChild.left = node;
  node.parent = rightChild;
  return root;
}

function rotateRightSync(root: RBTreeNode, node: RBTreeNode): RBTreeNode {
  const leftChild = node.left!;
  node.left = leftChild.right;
  if (leftChild.right) leftChild.right.parent = node;
  leftChild.parent = node.parent;
  if (!node.parent) {
    root = leftChild;
  } else if (node === node.parent.right) {
    node.parent.right = leftChild;
  } else {
    node.parent.left = leftChild;
  }
  leftChild.right = node;
  node.parent = leftChild;
  return root;
}

const DEFAULT_VALUES = [50, 30, 70, 20, 40, 60, 80];

export function useRedBlackTree({ onStatsChange }: UseRedBlackTreeProps = {}) {
  const [treeValues, setTreeValues] = useState<number[]>(DEFAULT_VALUES);

  const [tree, setTree] = useState<RBTreeNode | null>(() => {
    let root: RBTreeNode | null = null;
    DEFAULT_VALUES.forEach(value => {
      root = rbInsertSync(root, value);
    });
    return root;
  });

  const [displayTree, setDisplayTree] = useState<RBTreeNode | null>(tree);
  const [steps, setSteps] = useState<RBTreeStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [operation, setOperation] = useState<string>('');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [recoloringNodeId, setRecoloringNodeId] = useState<string | null>(null);
  const [rotatingNodeId, setRotatingNodeId] = useState<string | null>(null);
  const [violationNodeId, setViolationNodeId] = useState<string | null>(null);
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[stepIndex];

  // Calculate tree statistics
  const getStats = useCallback((): RBTreeStats => {
    const getHeight = (node: RBTreeNode | null): number => {
      if (!node) return 0;
      return 1 + Math.max(getHeight(node.left), getHeight(node.right));
    };

    const getSize = (node: RBTreeNode | null): number => {
      if (!node) return 0;
      return 1 + getSize(node.left) + getSize(node.right);
    };

    const getBlackHeight = (node: RBTreeNode | null): number => {
      if (!node) return 1;
      const leftHeight = getBlackHeight(node.left);
      return leftHeight + (node.color === 'black' ? 1 : 0);
    };

    const targetTree = displayTree || tree;
    const validation = validateRBTree(targetTree);

    return {
      size: getSize(targetTree),
      height: getHeight(targetTree),
      blackHeight: getBlackHeight(targetTree),
      valid: validation.valid
    };
  }, [tree, displayTree]);

  // Notify parent of stats changes
  useEffect(() => {
    onStatsChange?.(getStats());
  }, [tree, displayTree, onStatsChange, getStats]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    if (stepIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    animationTimeoutRef.current = setTimeout(() => {
      setStepIndex(prev => prev + 1);
    }, speed);

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isPlaying, stepIndex, steps, speed]);

  // Handle current step
  useEffect(() => {
    if (!currentStep) return;

    switch (currentStep.type) {
      case 'compare':
        setActiveNodeId(currentStep.nodeId);
        setSearchPath(prev => [...prev, currentStep.nodeId]);
        break;
      case 'insert':
        setActiveNodeId(currentStep.nodeId);
        break;
      case 'recolor':
        setRecoloringNodeId(currentStep.nodeId);
        setActiveNodeId(currentStep.nodeId);
        break;
      case 'rotate-left':
      case 'rotate-right':
        setRotatingNodeId(currentStep.pivotId);
        break;
      case 'fix-violation':
        setViolationNodeId(currentStep.nodeId);
        break;
      case 'search':
        if (currentStep.found) {
          setActiveNodeId(currentStep.nodeId);
        }
        break;
      case 'delete':
        setActiveNodeId(currentStep.nodeId);
        break;
      case 'done':
        setTree(currentStep.tree);
        setDisplayTree(currentStep.tree);
        // Update treeValues
        if (currentStep.tree) {
          setTreeValues(inOrderTraversal(currentStep.tree));
        } else {
          setTreeValues([]);
        }
        // Clear highlights after a delay
        setTimeout(() => {
          setActiveNodeId(null);
          setRecoloringNodeId(null);
          setRotatingNodeId(null);
          setViolationNodeId(null);
          setSearchPath([]);
        }, 500);
        break;
    }
  }, [currentStep]);

  const resetHighlights = () => {
    setActiveNodeId(null);
    setRecoloringNodeId(null);
    setRotatingNodeId(null);
    setViolationNodeId(null);
    setSearchPath([]);
  };

  const insert = useCallback((value: number) => {
    setOperation('insert');
    resetHighlights();
    const treeCopy = cloneRBTree(tree);
    const generator = rbInsert(treeCopy, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTree(tree);
    setIsPlaying(true);
  }, [tree]);

  const search = useCallback((value: number) => {
    setOperation('search');
    resetHighlights();
    const generator = rbSearch(tree, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTree(tree);
    setIsPlaying(true);
  }, [tree]);

  const deleteNode = useCallback((value: number) => {
    setOperation('delete');
    resetHighlights();
    const treeCopy = cloneRBTree(tree);
    const generator = rbDelete(treeCopy, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTree(tree);
    setIsPlaying(true);
  }, [tree]);

  const buildFromArray = useCallback((values?: number[]) => {
    setOperation('build');
    resetHighlights();
    setDisplayTree(null);

    let buildValues: number[];
    if (values && values.length > 0) {
      buildValues = values;
    } else {
      const valueSet = new Set<number>();
      while (valueSet.size < 10) {
        valueSet.add(Math.floor(Math.random() * 100) + 1);
      }
      buildValues = Array.from(valueSet);
    }

    setTreeValues(buildValues);

    // Build the tree synchronously
    let finalTree: RBTreeNode | null = null;
    buildValues.forEach(v => {
      finalTree = rbInsertSync(finalTree, v);
    });
    setTree(finalTree);
    setDisplayTree(finalTree);

    // For now, just show the final result (build animation can be complex)
    setSteps([{ type: 'done', tree: finalTree, operation: 'build' }]);
    setStepIndex(0);
  }, []);

  const clear = useCallback(() => {
    setTree(null);
    setDisplayTree(null);
    setTreeValues([]);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
    setOperation('');
    resetHighlights();
  }, []);

  const play = useCallback(() => {
    if (treeValues.length > 0 && steps.length === 0) {
      buildFromArray(treeValues);
    } else {
      setIsPlaying(true);
    }
  }, [treeValues, steps.length, buildFromArray]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const step = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  }, [stepIndex, steps.length]);

  const reset = useCallback(() => {
    setStepIndex(0);
    setIsPlaying(false);
    setDisplayTree(tree);
    resetHighlights();
  }, [tree]);

  const generateRandom = useCallback((count: number = 10) => {
    const valueSet = new Set<number>();
    while (valueSet.size < count) {
      valueSet.add(Math.floor(Math.random() * 100) + 1);
    }
    buildFromArray(Array.from(valueSet));
  }, [buildFromArray]);

  return {
    tree: displayTree,
    operation,
    activeNodeId,
    recoloringNodeId,
    rotatingNodeId,
    violationNodeId,
    searchPath,
    steps,
    stepIndex,
    totalSteps: steps.length,
    currentStep,
    isPlaying,
    speed,
    insert,
    search,
    deleteNode,
    buildFromArray,
    generateRandom,
    clear,
    play,
    pause,
    step,
    reset,
    setSpeed,
    stats: getStats(),
    calculateLayout: (width: number, height: number) => calculateRBTreeLayout(displayTree, width, height)
  };
}
