import { useState } from "react";
import { ComplexityMeta } from "../../types/complexity";
import { DataStructureType } from "../../types/dataStructures";
import BinarySearchTreeVisualizer from "./BinarySearchTreeVisualizer";
import BinarySearchTreeControls from "../controls/BinarySearchTreeControls";
import AVLTreeVisualizer from "./AVLTreeVisualizer";
import AVLTreeControls from "../controls/AVLTreeControls";
import HeapVisualizer from "./HeapVisualizer";
import HashTableVisualizer from "./HashTableVisualizer";
import LinkedListVisualizer from "./LinkedListVisualizer";
import RedBlackTreeVisualizer from "./RedBlackTreeVisualizer";
import { useBinarySearchTree } from "../../hooks/useBinarySearchTree";
import { useAVLTree } from "../../hooks/useAVLTree";

type DataStructureVisualizerProps = {
  onComplexityChange?: (meta: ComplexityMeta) => void;
};

const complexityByDS: Record<DataStructureType, ComplexityMeta> = {
  bst: {
    name: "Binary Search Tree",
    best: "O(log n)",
    average: "O(log n)",
    worst: "O(n)",
    description: "Binary tree data structure that maintains sorted order and enables efficient search, insertion, and deletion operations."
  },
  heap: {
    name: "Heap (Priority Queue)",
    best: "O(1)",
    average: "O(log n)",
    worst: "O(log n)",
    description: "Specialized tree-based structure that satisfies the heap property, commonly used for implementing priority queues."
  },
  hashtable: {
    name: "Hash Table",
    best: "O(1)",
    average: "O(1)",
    worst: "O(n)",
    description: "Data structure that maps keys to values using a hash function, providing efficient average-case performance for insertions and lookups."
  },
  avl: {
    name: "AVL Tree",
    best: "O(log n)",
    average: "O(log n)",
    worst: "O(log n)",
    description: "Self-balancing binary search tree where the heights of the two child subtrees of any node differ by at most one."
  },
  linkedlist: {
    name: "Linked List",
    best: "O(1)",
    average: "O(n)",
    worst: "O(n)",
    description: "Linear data structure where elements are not stored at contiguous memory locations and are linked using pointers."
  },
  rbtree: {
    name: "Red-Black Tree",
    best: "O(log n)",
    average: "O(log n)",
    worst: "O(log n)",
    description: "Self-balancing BST using color properties to ensure O(log n) operations."
  }
};

// Only show implemented data structures
const implementedDS: DataStructureType[] = ['bst', 'avl', 'rbtree', 'heap', 'hashtable', 'linkedlist'];

export default function DataStructuresVisualizer({ onComplexityChange }: DataStructureVisualizerProps) {
  const [activeDS, setActiveDS] = useState<DataStructureType>("bst");

  // BST hook
  const bst = useBinarySearchTree({
    onComplexityChange: () => {
      if (activeDS === 'bst') {
        onComplexityChange?.(complexityByDS.bst);
      }
    }
  });

  // AVL hook
  const avl = useAVLTree({
    onStatsChange: () => {
      if (activeDS === 'avl') {
        onComplexityChange?.(complexityByDS.avl);
      }
    }
  });

  // Update complexity when switching data structures
  const handleDSChange = (ds: DataStructureType) => {
    if (ds === activeDS) return;
    setActiveDS(ds);
    onComplexityChange?.(complexityByDS[ds]);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Data Structure Selector */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full bg-purple-500/30 px-3 py-1 text-purple-100">Data Structures</span>
        <div className="flex flex-wrap gap-2">
          {implementedDS.map((ds) => (
            <button
              key={ds}
              type="button"
              onClick={() => handleDSChange(ds)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                activeDS === ds
                  ? "border-purple-400 bg-purple-500/15 text-purple-50"
                  : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600"
              }`}
            >
              {complexityByDS[ds].name}
            </button>
          ))}
        </div>
      </div>

      {/* BST Visualizer */}
      {activeDS === 'bst' && (
        <div className="flex flex-col gap-3 md:flex-row flex-1 min-h-0">
          <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col min-h-0">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Data Structure: {complexityByDS.bst.name}</span>
              <span>Operation: {bst.operation || 'Idle'}</span>
            </div>
            <BinarySearchTreeVisualizer
              tree={bst.tree}
              currentStep={bst.currentStep}
              highlightPath={bst.highlightPath}
              className="flex-1"
            />
          </div>
          <BinarySearchTreeControls
            onInsert={bst.insert}
            onSearch={bst.search}
            onDelete={bst.deleteNode}
            onBuild={bst.buildFromArray}
            onClear={bst.clear}
            onValidate={bst.validate}
            isPlaying={bst.isPlaying}
            onPlay={bst.play}
            onPause={bst.pause}
            onStep={bst.step}
            onReset={bst.reset}
            stepIndex={bst.stepIndex}
            totalSteps={bst.totalSteps}
            speed={bst.speed}
            onSpeedChange={bst.setSpeed}
            operation={bst.operation}
            stats={bst.stats}
          />
        </div>
      )}

      {/* AVL Tree Visualizer */}
      {activeDS === 'avl' && (
        <div className="flex flex-col gap-3 md:flex-row flex-1 min-h-0">
          <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col min-h-0">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Data Structure: {complexityByDS.avl.name}</span>
              <span>Operation: {avl.operation || 'Idle'}</span>
            </div>
            <AVLTreeVisualizer
              tree={avl.tree}
              currentStep={avl.currentStep}
              highlightPath={avl.highlightPath}
              rotationInfo={avl.rotationInfo}
              className="flex-1"
            />
          </div>
          <AVLTreeControls
            onInsert={avl.insert}
            onSearch={avl.search}
            onDelete={avl.deleteNode}
            onBuild={avl.build}
            onClear={avl.clear}
            isPlaying={avl.isPlaying}
            onPlay={avl.play}
            onPause={avl.pause}
            onStep={avl.step}
            onReset={avl.reset}
            stepIndex={avl.stepIndex}
            totalSteps={avl.totalSteps}
            speed={avl.speed}
            onSpeedChange={avl.setSpeed}
            operation={avl.operation}
            stats={avl.stats}
          />
        </div>
      )}

      {/* Heap Visualizer */}
      {activeDS === 'heap' && (
        <HeapVisualizer onComplexityChange={onComplexityChange} />
      )}

      {/* Hash Table Visualizer */}
      {activeDS === 'hashtable' && (
        <HashTableVisualizer onComplexityChange={onComplexityChange} />
      )}

      {/* Linked List Visualizer */}
      {activeDS === 'linkedlist' && (
        <LinkedListVisualizer onComplexityChange={onComplexityChange} />
      )}

      {/* Red-Black Tree Visualizer */}
      {activeDS === 'rbtree' && (
        <RedBlackTreeVisualizer onComplexityChange={onComplexityChange} />
      )}
    </div>
  );
}
