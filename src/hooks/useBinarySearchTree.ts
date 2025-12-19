import { useState, useEffect, useRef, useCallback } from 'react';
import { TreeNode, BSTStep, DataStructureStats } from '../types/dataStructures';
import { bstInsert, bstSearch, bstDelete, buildBST, bstValidate } from '../algorithms/datastructures/binarySearchTree';

// Helper function for synchronous BST insertion (for initialization)
function bstInsertSync(root: TreeNode | null, value: number): TreeNode {
  if (!root) {
    return { id: `node-${value}-${Date.now()}`, value, left: null, right: null };
  }

  if (value < root.value) {
    root.left = bstInsertSync(root.left, value);
  } else if (value > root.value) {
    root.right = bstInsertSync(root.right, value);
  }

  return root;
}

// Get all values from tree via in-order traversal
function getTreeValues(node: TreeNode | null): number[] {
  if (!node) return [];
  return [...getTreeValues(node.left), node.value, ...getTreeValues(node.right)];
}

interface UseBinarySearchTreeProps {
  onComplexityChange?: (stats: DataStructureStats) => void;
}

// Default initial values for the tree
const DEFAULT_VALUES = [50, 30, 70, 20, 40, 60, 80];

export function useBinarySearchTree({ onComplexityChange }: UseBinarySearchTreeProps = {}) {
  // Store the values used to build the current tree (for replay)
  const [treeValues, setTreeValues] = useState<number[]>(DEFAULT_VALUES);

  const [tree, setTree] = useState<TreeNode | null>(() => {
    // Initialize with a default tree
    let root: TreeNode | null = null;
    DEFAULT_VALUES.forEach(value => {
      root = bstInsertSync(root, value);
    });
    return root;
  });

  // displayTree is what we show during animations (can be partial)
  const [displayTree, setDisplayTree] = useState<TreeNode | null>(tree);

  const [steps, setSteps] = useState<BSTStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [operation, setOperation] = useState<string>('');
  const [searchValue, setSearchValue] = useState<number | null>(null);
  const [highlightPath, setHighlightPath] = useState<number[]>([]);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[stepIndex];

  // Calculate tree statistics
  const getStats = useCallback((): DataStructureStats => {
    const getHeight = (node: TreeNode | null): number => {
      if (!node) return 0;
      return 1 + Math.max(getHeight(node.left), getHeight(node.right));
    };

    const getSize = (node: TreeNode | null): number => {
      if (!node) return 0;
      return 1 + getSize(node.left) + getSize(node.right);
    };

    const getBalance = (node: TreeNode | null): number => {
      if (!node) return 0;
      return Math.abs(getHeight(node.left) - getHeight(node.right));
    };

    const targetTree = displayTree || tree;
    const height = getHeight(targetTree);
    const size = getSize(targetTree);
    const maxBalance = getBalance(targetTree);

    return {
      size,
      height: Math.max(0, height - 1),
      balance: maxBalance
    };
  }, [tree, displayTree]);

  // Notify parent of stats changes
  useEffect(() => {
    onComplexityChange?.(getStats());
  }, [tree, displayTree, onComplexityChange, getStats]);

  // Run animation
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    // Stop playing when we reach the last step
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

  // Handle current step - update displayTree for build operations
  useEffect(() => {
    if (currentStep) {
      // Update highlight path for compare operations
      if (currentStep.type === 'compare' && currentStep.path) {
        setHighlightPath(currentStep.path);
      }

      // For build operation, show tree progressively after each insert
      if (operation === 'build' && currentStep.type === 'insert' && currentStep.node) {
        // Build tree up to current insert
        const insertSteps = steps.slice(0, stepIndex + 1).filter(s => s.type === 'insert');
        let partialTree: TreeNode | null = null;
        insertSteps.forEach(s => {
          if (s.type === 'insert') {
            partialTree = bstInsertSync(partialTree, s.node.value);
          }
        });
        setDisplayTree(partialTree);
      }

      // When done, sync displayTree with final tree
      if (currentStep.type === 'done') {
        if (currentStep.tree) {
          setDisplayTree(currentStep.tree);
          if (['insert', 'delete', 'build'].includes(currentStep.operation)) {
            setTree(currentStep.tree);
            // Update treeValues for replay
            if (currentStep.operation === 'build') {
              setTreeValues(getTreeValues(currentStep.tree));
            } else if (currentStep.operation === 'insert' && currentStep.result) {
              setTreeValues(prev => [...prev, currentStep.result as number]);
            } else if (currentStep.operation === 'delete' && currentStep.result) {
              setTreeValues(prev => prev.filter(v => v !== currentStep.result));
            }
          }
        }
      }
    }
  }, [currentStep, stepIndex, steps, operation]);

  const insert = useCallback((value: number) => {
    setOperation('insert');
    setHighlightPath([]);
    // Deep clone the tree to avoid mutating the original during step generation
    const treeCopy = tree ? JSON.parse(JSON.stringify(tree)) : null;
    const generator = bstInsert(treeCopy, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTree(tree); // Keep showing current tree during operation
    // Auto-play the operation
    setIsPlaying(true);
  }, [tree]);

  const search = useCallback((value: number) => {
    setSearchValue(value);
    setOperation('search');
    setHighlightPath([]);
    const treeCopy = tree ? JSON.parse(JSON.stringify(tree)) : null;
    const generator = bstSearch(treeCopy, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTree(tree);
    // Auto-play the operation
    setIsPlaying(true);
  }, [tree]);

  const deleteNode = useCallback((value: number) => {
    setOperation('delete');
    setHighlightPath([]);
    const treeCopy = tree ? JSON.parse(JSON.stringify(tree)) : null;
    const generator = bstDelete(treeCopy, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTree(tree);
    // Auto-play the operation
    setIsPlaying(true);
  }, [tree]);

  const buildFromArray = useCallback((values?: number[]) => {
    setOperation('build');
    setHighlightPath([]);
    setDisplayTree(null); // Clear display tree to show building from scratch

    // Use provided values or generate random unique values
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
    const generator = buildBST(buildValues);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);

    // Build final tree synchronously for reference
    let finalTree: TreeNode | null = null;
    buildValues.forEach(v => {
      finalTree = bstInsertSync(finalTree, v);
    });
    setTree(finalTree);

    // Auto-play the build animation
    setIsPlaying(true);
  }, []);

  const validate = useCallback(() => {
    setOperation('validate');
    setHighlightPath([]);
    const treeCopy = tree ? JSON.parse(JSON.stringify(tree)) : null;
    const generator = bstValidate(treeCopy);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTree(tree);
    // Auto-play the operation
    setIsPlaying(true);
  }, [tree]);

  const clear = useCallback(() => {
    setTree(null);
    setDisplayTree(null);
    setTreeValues([]);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
    setOperation('');
    setSearchValue(null);
    setHighlightPath([]);
  }, []);

  // Play rebuilds the current tree from scratch with animation
  const play = useCallback(() => {
    if (treeValues.length > 0) {
      // Rebuild tree with animation
      buildFromArray(treeValues);
    } else {
      // No tree to rebuild, just start playing current steps if any
      setIsPlaying(true);
    }
  }, [treeValues, buildFromArray]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const step = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  }, [stepIndex, steps.length]);

  const reset = useCallback(() => {
    setStepIndex(0);
    setIsPlaying(false);
    // Reset displayTree based on operation
    if (operation === 'build') {
      setDisplayTree(null);
    } else {
      setDisplayTree(tree);
    }
  }, [operation, tree]);

  return {
    // Tree state - use displayTree for visualization
    tree: displayTree,
    operation,
    searchValue,
    highlightPath,

    // Animation state
    steps,
    stepIndex,
    totalSteps: steps.length,
    currentStep,
    isPlaying,
    speed,

    // Actions
    insert,
    search,
    deleteNode,
    buildFromArray,
    validate,
    clear,

    // Animation controls
    play,
    pause,
    step,
    reset,
    setSpeed,

    // Statistics
    stats: getStats()
  };
}
