"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAlgorithm } from "@/contexts/AlgorithmContext";
import { AlgorithmPills, NeonBadge } from "@/components/ui";
import { getAlgorithm, getAlgorithmsForCategory } from "@/data/algorithm-registry";
import { DataStructureType } from "@/types/dataStructures";

// Existing visualizer components
import BinarySearchTreeVisualizer from "@/components/visualizers/BinarySearchTreeVisualizer";
import BinarySearchTreeControls from "@/components/controls/BinarySearchTreeControls";
import AVLTreeVisualizer from "@/components/visualizers/AVLTreeVisualizer";
import AVLTreeControls from "@/components/controls/AVLTreeControls";
import HeapVisualizer from "@/components/visualizers/HeapVisualizer";
import HashTableVisualizer from "@/components/visualizers/HashTableVisualizer";
import LinkedListVisualizer from "@/components/visualizers/LinkedListVisualizer";
import RedBlackTreeVisualizer from "@/components/visualizers/RedBlackTreeVisualizer";
import { useBinarySearchTree } from "@/hooks/useBinarySearchTree";
import { useAVLTree } from "@/hooks/useAVLTree";

const slugToDS: Record<string, DataStructureType> = {
  "binary-search-tree": "bst",
  "avl-tree": "avl",
  "red-black-tree": "rbtree",
  heap: "heap",
  "hash-table": "hashtable",
  "linked-list": "linkedlist",
};

const dsAlgorithms = getAlgorithmsForCategory("data-structures").map((a) => ({
  key: a.id,
  label: a.name,
}));

interface Props {
  initialAlgorithm: string;
}

export default function DataStructureVisualizerClient({ initialAlgorithm }: Props) {
  const router = useRouter();
  const { setComplexity } = useAlgorithm();
  const [currentAlgorithm, setCurrentAlgorithm] = useState(initialAlgorithm);
  const activeDS = slugToDS[currentAlgorithm] || "bst";

  const bst = useBinarySearchTree({});
  const avl = useAVLTree({});

  useEffect(() => {
    const entry = getAlgorithm(currentAlgorithm);
    if (entry) setComplexity(entry.complexity);
  }, [currentAlgorithm, setComplexity]);

  const handleDSChange = (slug: string) => {
    setCurrentAlgorithm(slug);
    router.push(`/data-structures/${slug}`, { scroll: false });
  };

  // Complexity callback for visualizers that manage their own complexity
  const complexityCallback = (meta: any) => setComplexity(meta);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header: badge + pills */}
      <div className="flex flex-wrap items-center gap-3">
        <NeonBadge label="Data Structures" color="purple" />
        <AlgorithmPills
          algorithms={dsAlgorithms}
          active={currentAlgorithm}
          onChange={handleDSChange}
          accentColor="purple"
        />
      </div>

      {/* BST */}
      {activeDS === "bst" && (
        <div className="flex flex-col gap-3 md:flex-row flex-1 min-h-0">
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-surface-2/80 p-4 flex flex-col min-h-0">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>Binary Search Tree</span>
              <span>Operation: {bst.operation || "Idle"}</span>
            </div>
            <BinarySearchTreeVisualizer tree={bst.tree} currentStep={bst.currentStep} highlightPath={bst.highlightPath} className="flex-1" />
          </div>
          <BinarySearchTreeControls
            onInsert={bst.insert} onSearch={bst.search} onDelete={bst.deleteNode}
            onBuild={bst.buildFromArray} onClear={bst.clear} onValidate={bst.validate}
            isPlaying={bst.isPlaying} onPlay={bst.play} onPause={bst.pause}
            onStep={bst.step} onReset={bst.reset}
            stepIndex={bst.stepIndex} totalSteps={bst.totalSteps}
            speed={bst.speed} onSpeedChange={bst.setSpeed}
            operation={bst.operation} stats={bst.stats}
          />
        </div>
      )}

      {/* AVL */}
      {activeDS === "avl" && (
        <div className="flex flex-col gap-3 md:flex-row flex-1 min-h-0">
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-surface-2/80 p-4 flex flex-col min-h-0">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>AVL Tree</span>
              <span>Operation: {avl.operation || "Idle"}</span>
            </div>
            <AVLTreeVisualizer tree={avl.tree} currentStep={avl.currentStep} highlightPath={avl.highlightPath} rotationInfo={avl.rotationInfo} className="flex-1" />
          </div>
          <AVLTreeControls
            onInsert={avl.insert} onSearch={avl.search} onDelete={avl.deleteNode}
            onBuild={avl.build} onClear={avl.clear}
            isPlaying={avl.isPlaying} onPlay={avl.play} onPause={avl.pause}
            onStep={avl.step} onReset={avl.reset}
            stepIndex={avl.stepIndex} totalSteps={avl.totalSteps}
            speed={avl.speed} onSpeedChange={avl.setSpeed}
            operation={avl.operation} stats={avl.stats}
          />
        </div>
      )}

      {/* Heap */}
      {activeDS === "heap" && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <HeapVisualizer onComplexityChange={complexityCallback} />
        </div>
      )}

      {/* Hash Table */}
      {activeDS === "hashtable" && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <HashTableVisualizer onComplexityChange={complexityCallback} />
        </div>
      )}

      {/* Linked List */}
      {activeDS === "linkedlist" && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <LinkedListVisualizer onComplexityChange={complexityCallback} />
        </div>
      )}

      {/* Red-Black Tree */}
      {activeDS === "rbtree" && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <RedBlackTreeVisualizer onComplexityChange={complexityCallback} />
        </div>
      )}
    </div>
  );
}
