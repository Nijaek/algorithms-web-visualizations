import { useState, useEffect, useRef, useCallback } from 'react';
import { TreeNode, AVLStep, DataStructureStats } from '../types/dataStructures';
import { avlInsert, avlDelete, avlSearch, buildAVL, getAVLStats } from '../algorithms/datastructures/avlTree';

// Helper function for synchronous AVL insertion
function avlInsertSync(root: TreeNode | null, value: number): TreeNode {
  function createNode(val: number): TreeNode {
    return {
      id: Math.random().toString(36).substr(2, 9),
      value: val,
      left: null,
      right: null,
      height: 1,
      balance: 0
    };
  }

  function getHeight(node: TreeNode | null): number {
    return node?.height ?? 0;
  }

  function updateHeight(node: TreeNode): void {
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    node.balance = getHeight(node.left) - getHeight(node.right);
  }

  function rotateRight(y: TreeNode): TreeNode {
    const x = y.left!;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    updateHeight(y);
    updateHeight(x);
    return x;
  }

  function rotateLeft(x: TreeNode): TreeNode {
    const y = x.right!;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    updateHeight(x);
    updateHeight(y);
    return y;
  }

  function insert(node: TreeNode | null, val: number): TreeNode {
    if (!node) return createNode(val);

    if (val < node.value) {
      node.left = insert(node.left, val);
    } else if (val > node.value) {
      node.right = insert(node.right, val);
    } else {
      return node;
    }

    updateHeight(node);
    const balance = (node.balance ?? 0);

    if (balance > 1 && val < node.left!.value) return rotateRight(node);
    if (balance < -1 && val > node.right!.value) return rotateLeft(node);
    if (balance > 1 && val > node.left!.value) {
      node.left = rotateLeft(node.left!);
      return rotateRight(node);
    }
    if (balance < -1 && val < node.right!.value) {
      node.right = rotateRight(node.right!);
      return rotateLeft(node);
    }

    return node;
  }

  return insert(root, value);
}

// Get all values from tree
function getTreeValues(node: TreeNode | null): number[] {
  if (!node) return [];
  return [...getTreeValues(node.left), node.value, ...getTreeValues(node.right)];
}

interface UseAVLTreeProps {
  onStatsChange?: (stats: DataStructureStats) => void;
}

const DEFAULT_VALUES = [50, 30, 70, 20, 40, 60, 80];

export function useAVLTree({ onStatsChange }: UseAVLTreeProps = {}) {
  const [treeValues, setTreeValues] = useState<number[]>(DEFAULT_VALUES);

  const [tree, setTree] = useState<TreeNode | null>(() => {
    let root: TreeNode | null = null;
    DEFAULT_VALUES.forEach(value => {
      root = avlInsertSync(root, value);
    });
    return root;
  });

  const [displayTree, setDisplayTree] = useState<TreeNode | null>(tree);
  const [steps, setSteps] = useState<AVLStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [operation, setOperation] = useState<string>('');
  const [highlightPath, setHighlightPath] = useState<number[]>([]);
  const [rotationInfo, setRotationInfo] = useState<string>('');
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[stepIndex];

  // Calculate statistics
  const getStats = useCallback((): DataStructureStats => {
    const stats = getAVLStats(displayTree);
    return {
      size: stats.size,
      height: stats.height,
      balance: stats.isBalanced ? 0 : 1
    };
  }, [displayTree]);

  // Notify parent of stats changes
  useEffect(() => {
    onStatsChange?.(getStats());
  }, [displayTree, onStatsChange, getStats]);

  // Run animation
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
        setHighlightPath(currentStep.path);
        setRotationInfo('');
        break;
      case 'insert':
        // For build operation, show tree progressively
        if (operation === 'build') {
          const insertSteps = steps.slice(0, stepIndex + 1).filter(s => s.type === 'insert');
          let partialTree: TreeNode | null = null;
          insertSteps.forEach(s => {
            if (s.type === 'insert') {
              partialTree = avlInsertSync(partialTree, s.node.value);
            }
          });
          setDisplayTree(partialTree);
        }
        break;
      case 'balance-check':
        setRotationInfo(currentStep.needsRotation
          ? `Balance: ${currentStep.balance} - Rotation needed!`
          : `Balance: ${currentStep.balance} - OK`);
        break;
      case 'rotate-left':
        setRotationInfo('Performing Left Rotation');
        break;
      case 'rotate-right':
        setRotationInfo('Performing Right Rotation');
        break;
      case 'rotate-left-right':
        setRotationInfo('Performing Left-Right Rotation');
        break;
      case 'rotate-right-left':
        setRotationInfo('Performing Right-Left Rotation');
        break;
      case 'done':
        setHighlightPath([]);
        setRotationInfo('');
        if (currentStep.tree) {
          setDisplayTree(currentStep.tree);
          if (['insert', 'delete', 'build'].includes(currentStep.operation)) {
            setTree(currentStep.tree);
            setTreeValues(getTreeValues(currentStep.tree));
          }
        }
        break;
    }
  }, [currentStep, stepIndex, steps, operation]);

  const insert = useCallback((value: number) => {
    setOperation('insert');
    setHighlightPath([]);
    setRotationInfo('');
    const generator = avlInsert(tree, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTree(tree);
    setIsPlaying(true);
  }, [tree]);

  const search = useCallback((value: number) => {
    setOperation('search');
    setHighlightPath([]);
    setRotationInfo('');
    const generator = avlSearch(tree, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTree(tree);
    setIsPlaying(true);
  }, [tree]);

  const deleteNode = useCallback((value: number) => {
    setOperation('delete');
    setHighlightPath([]);
    setRotationInfo('');
    const generator = avlDelete(tree, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTree(tree);
    setIsPlaying(true);
  }, [tree]);

  const build = useCallback((values?: number[]) => {
    setOperation('build');
    setHighlightPath([]);
    setRotationInfo('');
    setDisplayTree(null);

    const buildValues = values || Array.from(
      { length: 10 },
      () => Math.floor(Math.random() * 100) + 1
    ).filter((v, i, arr) => arr.indexOf(v) === i);

    setTreeValues(buildValues);

    // Build final tree synchronously
    let finalTree: TreeNode | null = null;
    buildValues.forEach(v => {
      finalTree = avlInsertSync(finalTree, v);
    });
    setTree(finalTree);

    const generator = buildAVL(buildValues);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }, []);

  const clear = useCallback(() => {
    setTree(null);
    setDisplayTree(null);
    setTreeValues([]);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
    setOperation('');
    setHighlightPath([]);
    setRotationInfo('');
  }, []);

  const play = useCallback(() => {
    if (treeValues.length > 0) {
      build(treeValues);
    }
  }, [treeValues, build]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const step = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  }, [stepIndex, steps.length]);

  const reset = useCallback(() => {
    setStepIndex(0);
    setIsPlaying(false);
    setHighlightPath([]);
    setRotationInfo('');
    if (operation === 'build') {
      setDisplayTree(null);
    } else {
      setDisplayTree(tree);
    }
  }, [operation, tree]);

  return {
    tree: displayTree,
    operation,
    highlightPath,
    rotationInfo,
    steps,
    stepIndex,
    totalSteps: steps.length,
    currentStep,
    isPlaying,
    speed,
    insert,
    search,
    deleteNode,
    build,
    clear,
    play,
    pause,
    step,
    reset,
    setSpeed,
    stats: getStats()
  };
}
