import React, { useState, useEffect } from 'react';
import { useLinkedList } from '../../hooks/useLinkedList';
import { ComplexityMeta } from '../../types/complexity';
import { LinkedListType } from '../../types/dataStructures';

interface LinkedListVisualizerProps {
  onComplexityChange?: (meta: ComplexityMeta) => void;
}

const linkedListComplexity: ComplexityMeta = {
  name: "Linked List",
  best: "O(1)",
  average: "O(n)",
  worst: "O(n)",
  description: "Linear data structure with nodes connected by pointers. O(1) head operations, O(n) search/access."
};

export default function LinkedListVisualizer({ onComplexityChange }: LinkedListVisualizerProps) {
  const {
    list,
    listType,
    operation,
    activeNodeId,
    highlightNodeId,
    traversePath,
    foundNodeId,
    deletingNodeId,
    insertingNode,
    stepIndex,
    totalSteps,
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
    stats
  } = useLinkedList({
    onStatsChange: () => onComplexityChange?.(linkedListComplexity)
  });

  const [valueInput, setValueInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [indexInput, setIndexInput] = useState('');

  // Auto-generate list on mount and when list type changes
  useEffect(() => {
    generateRandom(5);
  }, [listType]);

  const handleInsertHead = () => {
    const value = parseInt(valueInput);
    if (!isNaN(value)) {
      insertHead(value);
      setValueInput('');
    }
  };

  const handleInsertTail = () => {
    const value = parseInt(valueInput);
    if (!isNaN(value)) {
      insertTail(value);
      setValueInput('');
    }
  };

  const handleInsertAt = () => {
    const value = parseInt(valueInput);
    const index = parseInt(indexInput);
    if (!isNaN(value) && !isNaN(index) && index >= 0) {
      insertAt(value, index);
      setValueInput('');
      setIndexInput('');
    }
  };

  const handleSearch = () => {
    const value = parseInt(searchInput);
    if (!isNaN(value)) {
      search(value);
    }
  };

  const handleDeleteValue = () => {
    const value = parseInt(searchInput);
    if (!isNaN(value)) {
      deleteValue(value);
      setSearchInput('');
    }
  };

  const getNodeColor = (nodeId: string) => {
    if (deletingNodeId === nodeId) return '#ef4444'; // Red for deleting
    if (foundNodeId === nodeId) return '#10b981'; // Green for found
    if (activeNodeId === nodeId) return '#06b6d4'; // Cyan for active
    if (highlightNodeId === nodeId) return '#a855f7'; // Purple for comparing
    if (traversePath.includes(nodeId)) return '#3b82f6'; // Blue for path
    return '#334155'; // Default slate
  };

  const getNodeBorderColor = (nodeId: string) => {
    if (deletingNodeId === nodeId) return '#fca5a5';
    if (foundNodeId === nodeId) return '#6ee7b7';
    if (activeNodeId === nodeId) return '#67e8f9';
    if (highlightNodeId === nodeId) return '#c4b5fd';
    if (traversePath.includes(nodeId)) return '#93c5fd';
    return '#475569';
  };

  const listTypes: { value: LinkedListType; label: string }[] = [
    { value: 'singly', label: 'Singly Linked' },
    { value: 'doubly', label: 'Doubly Linked' }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full bg-purple-500/30 px-3 py-1 text-purple-100">Linked List</span>
        <div className="flex gap-2">
          {listTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => changeListType(t.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                listType === t.value
                  ? 'border-purple-400 bg-purple-500/15 text-purple-50'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        {/* Visualizer */}
        <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col min-h-[400px]">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Data Structure: {listType === 'singly' ? 'Singly' : 'Doubly'} Linked List</span>
            <span>Operation: {operation || 'Idle'}</span>
          </div>

          <div className="flex-1 bg-[#0b1020] rounded-lg overflow-auto min-h-[300px]">
            <div className="p-4 min-w-max">
              {/* Step info */}
              {currentStep && (
                <div className="mb-4 text-center text-sm text-slate-300">
                  {currentStep.type === 'traverse' && `Traversing to index ${currentStep.index}`}
                  {currentStep.type === 'compare' && `Comparing ${currentStep.value} with ${currentStep.searchValue}`}
                  {currentStep.type === 'insert-head' && `Inserting ${currentStep.node.value} at head`}
                  {currentStep.type === 'insert-tail' && `Inserting ${currentStep.node.value} at tail`}
                  {currentStep.type === 'insert-at' && `Inserting ${currentStep.node.value} at index ${currentStep.index}`}
                  {currentStep.type === 'delete-head' && `Deleting head node`}
                  {currentStep.type === 'delete-tail' && `Deleting tail node`}
                  {currentStep.type === 'delete-node' && `Deleting node at index ${currentStep.index}`}
                  {currentStep.type === 'search' && (currentStep.found ? `Found at index ${currentStep.index}` : 'Not found')}
                  {currentStep.type === 'reverse-step' && `Reversing: swapping pointers`}
                  {currentStep.type === 'update-pointers' && `Updating ${currentStep.pointerType} pointer`}
                  {currentStep.type === 'done' && `Operation complete: ${currentStep.operation}`}
                </div>
              )}

              {/* Linked List Visualization */}
              {list.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-500">
                  <span>Empty list. Insert a node to begin.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-8 px-4">
                  {/* Head label */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-cyan-400 mb-1">HEAD</span>
                    <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-cyan-400"></div>
                  </div>

                  {list.map((node, index) => (
                    <React.Fragment key={node.id}>
                      {/* Prev arrow for doubly linked list */}
                      {listType === 'doubly' && index > 0 && (
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-amber-400 text-lg">&larr;</span>
                        </div>
                      )}

                      {/* Node */}
                      <div
                        className="flex flex-col items-center transition-all duration-300"
                        style={{
                          transform: activeNodeId === node.id ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        <div
                          className="relative flex items-center justify-center w-16 h-16 rounded-lg border-2 transition-all duration-300"
                          style={{
                            backgroundColor: getNodeColor(node.id),
                            borderColor: getNodeBorderColor(node.id),
                            boxShadow: activeNodeId === node.id ? '0 0 20px rgba(6, 182, 212, 0.5)' : 'none'
                          }}
                        >
                          <span className="text-lg font-mono font-bold text-white">
                            {node.value}
                          </span>
                          {/* Index label */}
                          <span className="absolute -bottom-5 text-xs text-slate-500">
                            [{index}]
                          </span>
                        </div>
                      </div>

                      {/* Next arrow */}
                      {index < list.length - 1 && (
                        <div className="flex items-center justify-center">
                          <span className="text-cyan-400 text-2xl">&rarr;</span>
                        </div>
                      )}

                      {/* NULL indicator at end */}
                      {index === list.length - 1 && (
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 text-2xl">&rarr;</span>
                          <div className="px-3 py-2 rounded border border-slate-700 bg-slate-800/50">
                            <span className="text-slate-500 text-sm font-mono">NULL</span>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Tail label */}
                  {list.length > 0 && (
                    <div className="flex flex-col items-center ml-4">
                      <span className="text-xs text-green-400 mb-1">TAIL</span>
                      <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-green-400"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Inserting node preview */}
              {insertingNode && (
                <div className="flex justify-center mt-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-500/50 bg-purple-500/10">
                    <span className="text-purple-300 text-sm">Inserting:</span>
                    <div className="w-12 h-12 rounded-lg border-2 border-purple-400 bg-purple-500/30 flex items-center justify-center">
                      <span className="text-lg font-mono font-bold text-white">{insertingNode.value}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full md:w-80 rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 tracking-wide">LINKED LIST CONTROLS</h3>

          {/* Insert */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Insert</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                placeholder="Value"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-purple-500 focus:outline-none min-w-0"
              />
              <input
                type="number"
                value={indexInput}
                onChange={(e) => setIndexInput(e.target.value)}
                placeholder="Index"
                className="w-20 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleInsertHead}
                className="rounded-lg bg-cyan-600 px-2 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Head
              </button>
              <button
                onClick={handleInsertTail}
                className="rounded-lg bg-green-600 px-2 py-2 text-xs font-semibold text-white hover:bg-green-500"
              >
                Tail
              </button>
              <button
                onClick={handleInsertAt}
                className="rounded-lg bg-purple-600 px-2 py-2 text-xs font-semibold text-white hover:bg-purple-500"
              >
                At Index
              </button>
            </div>
          </div>

          {/* Search / Delete */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Search / Delete by Value</label>
            <input
              type="number"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Value"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Search
              </button>
              <button
                onClick={handleDeleteValue}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Delete Head/Tail */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Delete</label>
            <div className="flex gap-2">
              <button
                onClick={deleteHead}
                className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500"
              >
                Delete Head
              </button>
              <button
                onClick={deleteTail}
                className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500"
              >
                Delete Tail
              </button>
            </div>
          </div>

          {/* Reverse */}
          <button
            onClick={reverse}
            disabled={list.length < 2}
            className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
          >
            Reverse List
          </button>

          {/* Statistics */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 space-y-1">
            <h4 className="text-xs font-semibold text-slate-400">Statistics</h4>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Size:</span>
              <span className="text-slate-200">{stats.size}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Type:</span>
              <span className="text-slate-200">{stats.type === 'singly' ? 'Singly Linked' : 'Doubly Linked'}</span>
            </div>
          </div>

          {/* Animation Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Animation</span>
              <span className="text-xs text-slate-500">Step: {stepIndex + 1} / {totalSteps || 1}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={isPlaying ? pause : play}
                className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={step}
                disabled={stepIndex >= totalSteps - 1}
                className="flex-1 rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500 disabled:opacity-50"
              >
                Step
              </button>
              <button
                onClick={reset}
                className="flex-1 rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Speed (ms)</span>
              <span className="text-xs text-cyan-400">{speed}</span>
            </div>
            <input
              type="range"
              min="50"
              max="800"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Regenerate / Clear */}
          <div className="flex gap-2">
            <button
              onClick={() => generateRandom(5)}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Regenerate
            </button>
            <button
              onClick={clear}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
