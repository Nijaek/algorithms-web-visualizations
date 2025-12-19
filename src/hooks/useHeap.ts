import { useState, useEffect, useRef, useCallback } from 'react';
import { HeapStep, DataStructureStats } from '../types/dataStructures';
import { heapInsert, heapExtractMax, buildHeap } from '../algorithms/datastructures/heap';

interface UseHeapProps {
  onStatsChange?: (stats: DataStructureStats) => void;
}

export function useHeap({ onStatsChange }: UseHeapProps = {}) {
  const [heap, setHeap] = useState<number[]>([64, 42, 58, 32, 38, 45, 27, 12, 24, 18]);
  const [displayHeap, setDisplayHeap] = useState<number[]>([64, 42, 58, 32, 38, 45, 27, 12, 24, 18]);
  const [steps, setSteps] = useState<HeapStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [operation, setOperation] = useState<string>('');
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[stepIndex];

  // Calculate statistics
  const getStats = useCallback((): DataStructureStats => {
    const h = displayHeap;
    const height = h.length > 0 ? Math.floor(Math.log2(h.length)) + 1 : 0;
    return {
      size: h.length,
      height,
      comparisons: 0,
      swaps: 0
    };
  }, [displayHeap]);

  // Notify parent of stats changes
  useEffect(() => {
    onStatsChange?.(getStats());
  }, [displayHeap, onStatsChange, getStats]);

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
        setActiveIndices([currentStep.index1, currentStep.index2]);
        break;
      case 'swap':
        setActiveIndices([currentStep.index1, currentStep.index2]);
        // Update display heap
        setDisplayHeap(prev => {
          const newHeap = [...prev];
          [newHeap[currentStep.index1], newHeap[currentStep.index2]] =
            [newHeap[currentStep.index2], newHeap[currentStep.index1]];
          return newHeap;
        });
        break;
      case 'insert':
        setActiveIndices([currentStep.index]);
        setDisplayHeap(prev => [...prev, currentStep.value]);
        break;
      case 'extract':
        setActiveIndices([currentStep.index]);
        break;
      case 'heapify':
        setActiveIndices([currentStep.index]);
        break;
      case 'done':
        setActiveIndices([]);
        setHeap(currentStep.heap);
        setDisplayHeap(currentStep.heap);
        break;
    }
  }, [currentStep]);

  const insert = useCallback((value: number) => {
    setOperation('insert');
    setActiveIndices([]);
    const generator = heapInsert([...heap], value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayHeap(heap);
    setIsPlaying(true);
  }, [heap]);

  const extractMax = useCallback(() => {
    if (heap.length === 0) return;
    setOperation('extract');
    setActiveIndices([]);
    const generator = heapExtractMax([...heap]);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayHeap(heap);
    setIsPlaying(true);
  }, [heap]);

  const build = useCallback((values?: number[]) => {
    setOperation('build');
    setActiveIndices([]);
    const buildValues = values || Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1);
    setDisplayHeap(buildValues);
    const generator = buildHeap(buildValues);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }, []);

  const clear = useCallback(() => {
    setHeap([]);
    setDisplayHeap([]);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
    setOperation('');
    setActiveIndices([]);
  }, []);

  const play = useCallback(() => {
    if (heap.length > 0) {
      build([...heap]);
    }
  }, [heap, build]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const step = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  }, [stepIndex, steps.length]);

  const reset = useCallback(() => {
    setStepIndex(0);
    setIsPlaying(false);
    setDisplayHeap(heap);
    setActiveIndices([]);
  }, [heap]);

  return {
    heap: displayHeap,
    operation,
    activeIndices,
    steps,
    stepIndex,
    totalSteps: steps.length,
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
    stats: getStats()
  };
}
