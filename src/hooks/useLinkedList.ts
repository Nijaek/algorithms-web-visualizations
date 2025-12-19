import { useState, useEffect, useRef, useCallback } from 'react';
import { LinkedListStep, LinkedListType, LinkedListNode } from '../types/dataStructures';
import {
  createNode,
  createDoublyNode,
  insertAtHead,
  insertAtTail,
  insertAtIndex,
  deleteAtHead,
  deleteAtTail,
  deleteByValue,
  searchList,
  reverseList,
  insertAtHeadDoubly,
  insertAtTailDoubly,
  insertAtIndexDoubly,
  deleteAtHeadDoubly,
  deleteAtTailDoubly,
  deleteByValueDoubly,
  reverseListDoubly,
  cloneList,
  listToArray
} from '../algorithms/datastructures/linkedList';

interface UseLinkedListProps {
  onStatsChange?: (stats: LinkedListStats) => void;
}

export interface LinkedListStats {
  size: number;
  type: LinkedListType;
}

export function useLinkedList({ onStatsChange }: UseLinkedListProps = {}) {
  const [head, setHead] = useState<LinkedListNode | null>(null);
  const [displayList, setDisplayList] = useState<LinkedListNode[]>([]);
  const [listType, setListType] = useState<LinkedListType>('singly');
  const [steps, setSteps] = useState<LinkedListStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [operation, setOperation] = useState<string>('');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);
  const [traversePath, setTraversePath] = useState<string[]>([]);
  const [foundNodeId, setFoundNodeId] = useState<string | null>(null);
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);
  const [insertingNode, setInsertingNode] = useState<LinkedListNode | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[stepIndex];

  // Calculate statistics
  const getStats = useCallback((): LinkedListStats => {
    const nodes = listToArray(head);
    return {
      size: nodes.length,
      type: listType
    };
  }, [head, listType]);

  // Notify parent of stats changes
  useEffect(() => {
    onStatsChange?.(getStats());
    setDisplayList(listToArray(head));
  }, [head, onStatsChange, getStats]);

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
      case 'traverse':
        setActiveNodeId(currentStep.nodeId);
        setTraversePath(prev => [...prev, currentStep.nodeId]);
        break;
      case 'compare':
        setActiveNodeId(currentStep.nodeId);
        setHighlightNodeId(currentStep.nodeId);
        break;
      case 'insert-head':
      case 'insert-tail':
      case 'insert-at':
        setInsertingNode(currentStep.node);
        break;
      case 'delete-head':
      case 'delete-tail':
      case 'delete-node':
        setDeletingNodeId(currentStep.nodeId);
        break;
      case 'search':
        if (currentStep.found) {
          setFoundNodeId(currentStep.nodeId);
        }
        break;
      case 'done':
        setHead(currentStep.list);
        setDisplayList(listToArray(currentStep.list));
        // Clear all highlight states after a short delay
        setTimeout(() => {
          setActiveNodeId(null);
          setHighlightNodeId(null);
          setTraversePath([]);
          setFoundNodeId(null);
          setDeletingNodeId(null);
          setInsertingNode(null);
        }, 500);
        break;
    }
  }, [currentStep]);

  // Operations
  const insertHead = useCallback((value: number) => {
    setOperation('insert-head');
    resetHighlights();
    const cloned = cloneList(head, listType === 'doubly');
    const generator = listType === 'singly'
      ? insertAtHead(cloned, value)
      : insertAtHeadDoubly(cloned, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }, [head, listType]);

  const insertTail = useCallback((value: number) => {
    setOperation('insert-tail');
    resetHighlights();
    const cloned = cloneList(head, listType === 'doubly');
    const generator = listType === 'singly'
      ? insertAtTail(cloned, value)
      : insertAtTailDoubly(cloned, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }, [head, listType]);

  const insertAt = useCallback((value: number, index: number) => {
    setOperation('insert-at');
    resetHighlights();
    const cloned = cloneList(head, listType === 'doubly');
    const generator = listType === 'singly'
      ? insertAtIndex(cloned, value, index)
      : insertAtIndexDoubly(cloned, value, index);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }, [head, listType]);

  const deleteHead = useCallback(() => {
    setOperation('delete-head');
    resetHighlights();
    const cloned = cloneList(head, listType === 'doubly');
    const generator = listType === 'singly'
      ? deleteAtHead(cloned)
      : deleteAtHeadDoubly(cloned);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }, [head, listType]);

  const deleteTail = useCallback(() => {
    setOperation('delete-tail');
    resetHighlights();
    const cloned = cloneList(head, listType === 'doubly');
    const generator = listType === 'singly'
      ? deleteAtTail(cloned)
      : deleteAtTailDoubly(cloned);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }, [head, listType]);

  const deleteValue = useCallback((value: number) => {
    setOperation('delete');
    resetHighlights();
    const cloned = cloneList(head, listType === 'doubly');
    const generator = listType === 'singly'
      ? deleteByValue(cloned, value)
      : deleteByValueDoubly(cloned, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }, [head, listType]);

  const search = useCallback((value: number) => {
    setOperation('search');
    resetHighlights();
    const generator = searchList(head, value);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }, [head]);

  const reverse = useCallback(() => {
    setOperation('reverse');
    resetHighlights();
    const cloned = cloneList(head, listType === 'doubly');
    const generator = listType === 'singly'
      ? reverseList(cloned)
      : reverseListDoubly(cloned);
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }, [head, listType]);

  const clear = useCallback(() => {
    setHead(null);
    setDisplayList([]);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
    setOperation('');
    resetHighlights();
  }, []);

  const resetHighlights = () => {
    setActiveNodeId(null);
    setHighlightNodeId(null);
    setTraversePath([]);
    setFoundNodeId(null);
    setDeletingNodeId(null);
    setInsertingNode(null);
  };

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  const step = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  }, [stepIndex, steps.length]);

  const reset = useCallback(() => {
    setStepIndex(0);
    setIsPlaying(false);
    setDisplayList(listToArray(head));
    resetHighlights();
  }, [head]);

  const changeListType = useCallback((type: LinkedListType) => {
    setListType(type);
    clear();
  }, [clear]);

  // Generate random list
  const generateRandom = useCallback((count: number = 5) => {
    clear();
    let newHead: LinkedListNode | null = null;
    let current: LinkedListNode | null = null;

    for (let i = 0; i < count; i++) {
      const value = Math.floor(Math.random() * 100);
      const newNode = listType === 'doubly' ? createDoublyNode(value) : createNode(value);

      if (!newHead) {
        newHead = newNode;
        current = newNode;
      } else {
        current!.next = newNode;
        if (listType === 'doubly') {
          newNode.prev = current;
        }
        current = newNode;
      }
    }

    setHead(newHead);
    setDisplayList(listToArray(newHead));
  }, [clear, listType]);

  return {
    list: displayList,
    head,
    listType,
    operation,
    activeNodeId,
    highlightNodeId,
    traversePath,
    foundNodeId,
    deletingNodeId,
    insertingNode,
    steps,
    stepIndex,
    totalSteps: steps.length,
    currentStep,
    isPlaying,
    speed,
    insertHead,
    insertTail,
    insertAt,
    deleteHead,
    deleteTail,
    deleteValue,
    search,
    reverse,
    clear,
    play,
    pause,
    step,
    reset,
    setSpeed,
    changeListType,
    generateRandom,
    stats: getStats()
  };
}
