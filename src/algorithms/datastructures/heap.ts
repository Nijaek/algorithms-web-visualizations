import { HeapStep } from "../../types/dataStructures";

// Max Heap implementation with step-by-step visualization

function getParentIndex(i: number): number {
  return Math.floor((i - 1) / 2);
}

function getLeftChildIndex(i: number): number {
  return 2 * i + 1;
}

function getRightChildIndex(i: number): number {
  return 2 * i + 2;
}

// Insert a value into the heap with animation steps
export function* heapInsert(heap: number[], value: number): Generator<HeapStep> {
  const newHeap = [...heap];
  newHeap.push(value);
  const insertIndex = newHeap.length - 1;

  yield { type: 'insert', index: insertIndex, value };

  // Bubble up
  let currentIndex = insertIndex;
  while (currentIndex > 0) {
    const parentIndex = getParentIndex(currentIndex);

    yield { type: 'compare', index1: currentIndex, index2: parentIndex };

    if (newHeap[currentIndex] > newHeap[parentIndex]) {
      // Swap
      yield { type: 'swap', index1: currentIndex, index2: parentIndex };
      [newHeap[currentIndex], newHeap[parentIndex]] = [newHeap[parentIndex], newHeap[currentIndex]];
      currentIndex = parentIndex;
    } else {
      break;
    }
  }

  yield { type: 'done', heap: newHeap, operation: 'insert', result: value };
}

// Extract the maximum value from the heap
export function* heapExtractMax(heap: number[]): Generator<HeapStep> {
  if (heap.length === 0) {
    yield { type: 'done', heap: [], operation: 'extract', result: null };
    return;
  }

  const newHeap = [...heap];
  const max = newHeap[0];

  yield { type: 'extract', index: 0, value: max };

  if (newHeap.length === 1) {
    yield { type: 'done', heap: [], operation: 'extract', result: max };
    return;
  }

  // Move last element to root
  newHeap[0] = newHeap.pop()!;
  yield { type: 'swap', index1: 0, index2: newHeap.length };

  // Bubble down (heapify)
  yield* heapifyDown(newHeap, 0);

  yield { type: 'done', heap: newHeap, operation: 'extract', result: max };
}

// Heapify down from a given index
function* heapifyDown(heap: number[], index: number): Generator<HeapStep> {
  const length = heap.length;

  while (true) {
    let largest = index;
    const left = getLeftChildIndex(index);
    const right = getRightChildIndex(index);

    if (left < length) {
      yield { type: 'compare', index1: largest, index2: left };
      if (heap[left] > heap[largest]) {
        largest = left;
      }
    }

    if (right < length) {
      yield { type: 'compare', index1: largest, index2: right };
      if (heap[right] > heap[largest]) {
        largest = right;
      }
    }

    if (largest !== index) {
      yield { type: 'swap', index1: index, index2: largest };
      [heap[index], heap[largest]] = [heap[largest], heap[index]];
      yield { type: 'heapify', index: largest, value: heap[largest] };
      index = largest;
    } else {
      break;
    }
  }
}

// Build a heap from an array
export function* buildHeap(array: number[]): Generator<HeapStep> {
  const heap = [...array];

  yield { type: 'build', array: heap };

  // Start from the last non-leaf node and heapify each node
  const startIndex = Math.floor(heap.length / 2) - 1;

  for (let i = startIndex; i >= 0; i--) {
    yield { type: 'heapify', index: i, value: heap[i] };
    yield* heapifyDown(heap, i);
  }

  yield { type: 'done', heap, operation: 'build', result: { size: heap.length } };
}

// Heap sort with visualization
export function* heapSort(array: number[]): Generator<HeapStep> {
  const heap = [...array];

  // Build max heap
  yield* buildHeap(heap);

  const sorted: number[] = [];

  // Extract elements one by one
  while (heap.length > 0) {
    const max = heap[0];
    yield { type: 'extract', index: 0, value: max };

    if (heap.length === 1) {
      sorted.unshift(max);
      heap.pop();
    } else {
      heap[0] = heap.pop()!;
      yield { type: 'swap', index1: 0, index2: heap.length };
      sorted.unshift(max);
      yield* heapifyDown(heap, 0);
    }
  }

  yield { type: 'done', heap: sorted, operation: 'sort', result: { sorted } };
}

// Peek at the maximum value without removing it
export function heapPeek(heap: number[]): number | null {
  return heap.length > 0 ? heap[0] : null;
}

// Get heap size
export function heapSize(heap: number[]): number {
  return heap.length;
}

// Check if heap is empty
export function heapIsEmpty(heap: number[]): boolean {
  return heap.length === 0;
}

// Validate heap property
export function* heapValidate(heap: number[]): Generator<HeapStep> {
  for (let i = 0; i < heap.length; i++) {
    const left = getLeftChildIndex(i);
    const right = getRightChildIndex(i);

    if (left < heap.length) {
      yield { type: 'compare', index1: i, index2: left };
      if (heap[i] < heap[left]) {
        yield { type: 'done', heap, operation: 'validate', result: { valid: false, violationAt: i } };
        return;
      }
    }

    if (right < heap.length) {
      yield { type: 'compare', index1: i, index2: right };
      if (heap[i] < heap[right]) {
        yield { type: 'done', heap, operation: 'validate', result: { valid: false, violationAt: i } };
        return;
      }
    }
  }

  yield { type: 'done', heap, operation: 'validate', result: { valid: true } };
}
