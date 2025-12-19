import { useState, useEffect, useRef, useCallback } from 'react';
import { HashTableStep, HashEntry, CollisionStrategy, DataStructureStats } from '../types/dataStructures';
import {
  createHashTable,
  hashInsertLinear,
  hashInsertQuadratic,
  hashInsertChaining,
  hashSearch,
  hashDelete,
  getLoadFactor
} from '../algorithms/datastructures/hashTable';

interface UseHashTableProps {
  onStatsChange?: (stats: DataStructureStats) => void;
}

export function useHashTable({ onStatsChange }: UseHashTableProps = {}) {
  const [table, setTable] = useState<HashEntry[]>(() => createHashTable(11));
  const [displayTable, setDisplayTable] = useState<HashEntry[]>(() => createHashTable(11));
  const [steps, setSteps] = useState<HashTableStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [operation, setOperation] = useState<string>('');
  const [strategy, setStrategy] = useState<CollisionStrategy>('linear-probing');
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [probeIndices, setProbeIndices] = useState<number[]>([]);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[stepIndex];

  // Calculate statistics
  const getStats = useCallback((): DataStructureStats => {
    const occupied = displayTable.filter(e => e.status === 'occupied').length;
    return {
      size: occupied,
      loadFactor: getLoadFactor(displayTable),
      collisions: displayTable.filter(e => e.probeCount && e.probeCount > 0).length
    };
  }, [displayTable]);

  // Notify parent of stats changes
  useEffect(() => {
    onStatsChange?.(getStats());
  }, [displayTable, onStatsChange, getStats]);

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
      case 'hash':
        setActiveIndices([currentStep.index]);
        setProbeIndices([]);
        break;
      case 'insert':
        setActiveIndices([currentStep.index]);
        setDisplayTable(prev => {
          const newTable = [...prev];
          newTable[currentStep.index] = {
            key: currentStep.key,
            value: currentStep.value,
            status: 'occupied'
          };
          return newTable;
        });
        break;
      case 'collision':
        setActiveIndices([currentStep.index]);
        break;
      case 'probe':
        setProbeIndices(currentStep.indexes);
        setActiveIndices([currentStep.indexes[currentStep.indexes.length - 1]]);
        break;
      case 'search':
        if (currentStep.index !== undefined) {
          setActiveIndices([currentStep.index]);
        }
        break;
      case 'delete':
        setActiveIndices([currentStep.index]);
        setDisplayTable(prev => {
          const newTable = [...prev];
          newTable[currentStep.index] = {
            ...newTable[currentStep.index],
            status: 'deleted'
          };
          return newTable;
        });
        break;
      case 'done':
        setActiveIndices([]);
        setProbeIndices([]);
        setTable(currentStep.table);
        setDisplayTable(currentStep.table);
        break;
    }
  }, [currentStep]);

  const insert = useCallback((key: string, value: string) => {
    setOperation('insert');
    setActiveIndices([]);
    setProbeIndices([]);

    let generator;
    switch (strategy) {
      case 'chaining':
        generator = hashInsertChaining([...table], key, value);
        break;
      case 'quadratic-probing':
        generator = hashInsertQuadratic([...table], key, value);
        break;
      default:
        generator = hashInsertLinear([...table], key, value);
    }

    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTable(table);
    setIsPlaying(true);
  }, [table, strategy]);

  const search = useCallback((key: string) => {
    setOperation('search');
    setActiveIndices([]);
    setProbeIndices([]);
    const generator = hashSearch(table, key, strategy);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTable(table);
    setIsPlaying(true);
  }, [table, strategy]);

  const remove = useCallback((key: string) => {
    setOperation('delete');
    setActiveIndices([]);
    setProbeIndices([]);
    const generator = hashDelete([...table], key, strategy);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setDisplayTable(table);
    setIsPlaying(true);
  }, [table, strategy]);

  const clear = useCallback(() => {
    const newTable = createHashTable(11);
    setTable(newTable);
    setDisplayTable(newTable);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
    setOperation('');
    setActiveIndices([]);
    setProbeIndices([]);
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => setIsPlaying(false), []);

  const step = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  }, [stepIndex, steps.length]);

  const reset = useCallback(() => {
    setStepIndex(0);
    setIsPlaying(false);
    setDisplayTable(table);
    setActiveIndices([]);
    setProbeIndices([]);
  }, [table]);

  const changeStrategy = useCallback((newStrategy: CollisionStrategy) => {
    setStrategy(newStrategy);
    clear();
  }, [clear]);

  return {
    table: displayTable,
    operation,
    strategy,
    activeIndices,
    probeIndices,
    steps,
    stepIndex,
    totalSteps: steps.length,
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
    stats: getStats()
  };
}
