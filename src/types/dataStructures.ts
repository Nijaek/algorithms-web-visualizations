// Base node interface for tree data structures
export interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
  height?: number; // For AVL trees
  balance?: number; // For AVL trees
}

// Hash table entry interface
export interface HashEntry {
  key: string;
  value: string;
  next?: HashEntry | null; // For separate chaining
  status?: 'empty' | 'occupied' | 'deleted'; // For open addressing
  probeCount?: number;
}

// Heap node interface
export interface HeapNode {
  value: number;
  index?: number;
}

// Step types for Binary Search Tree
export type BSTStep =
  | { type: 'compare'; node: TreeNode; value: number; path: number[] }
  | { type: 'insert'; node: TreeNode; parent: TreeNode | null; path: number[] }
  | { type: 'delete'; node: TreeNode; parent: TreeNode | null; path: number[] }
  | { type: 'search'; node: TreeNode; found: boolean; path: number[] }
  | { type: 'rotate'; node: TreeNode; direction: 'left' | 'right'; subtree: TreeNode }
  | { type: 'highlight'; node: TreeNode; reason: string }
  | { type: 'done'; tree: TreeNode | null; operation: string; result?: any };

// Step types for Heap operations
export type HeapStep =
  | { type: 'compare'; index1: number; index2: number }
  | { type: 'swap'; index1: number; index2: number }
  | { type: 'insert'; index: number; value: number }
  | { type: 'extract'; index: number; value: number }
  | { type: 'heapify'; index: number; value: number }
  | { type: 'build'; array: number[] }
  | { type: 'done'; heap: number[]; operation: string; result?: any };

// Step types for Hash Table
export type HashTableStep =
  | { type: 'hash'; key: string; index: number; hash: number }
  | { type: 'insert'; key: string; value: string; index: number }
  | { type: 'collision'; key: string; index: number; strategy: string }
  | { type: 'probe'; key: string; indexes: number[]; probeType: 'linear' | 'quadratic' | 'double' }
  | { type: 'search'; key: string; found: boolean; index?: number }
  | { type: 'delete'; key: string; index: number }
  | { type: 'rehash'; oldSize: number; newSize: number; entries: HashEntry[] }
  | { type: 'done'; table: HashEntry[]; operation: string; stats?: any };

// Step types for AVL Tree
export type AVLStep =
  | { type: 'compare'; node: TreeNode; value: number; path: number[] }
  | { type: 'insert'; node: TreeNode; parent: TreeNode | null; path: number[] }
  | { type: 'delete'; node: TreeNode; parent: TreeNode | null; path: number[] }
  | { type: 'search'; node: TreeNode; found: boolean; path: number[] }
  | { type: 'balance-check'; node: TreeNode; balance: number; needsRotation: boolean }
  | { type: 'rotate-left'; node: TreeNode; pivot: TreeNode }
  | { type: 'rotate-right'; node: TreeNode; pivot: TreeNode }
  | { type: 'rotate-left-right'; node: TreeNode }
  | { type: 'rotate-right-left'; node: TreeNode }
  | { type: 'update-height'; node: TreeNode; oldHeight: number; newHeight: number }
  | { type: 'highlight'; node: TreeNode; reason: string }
  | { type: 'done'; tree: TreeNode | null; operation: string; result?: any };

// ==================== LINKED LIST ====================

export interface LinkedListNode {
  id: string;
  value: number;
  next: LinkedListNode | null;
  prev?: LinkedListNode | null;  // For doubly linked list
  x?: number;                     // Layout position
  y?: number;
}

export type LinkedListType = 'singly' | 'doubly';

export type LinkedListStep =
  | { type: 'traverse'; nodeId: string; index: number }
  | { type: 'compare'; nodeId: string; value: number; searchValue: number }
  | { type: 'insert-head'; node: LinkedListNode }
  | { type: 'insert-tail'; node: LinkedListNode }
  | { type: 'insert-at'; node: LinkedListNode; index: number }
  | { type: 'delete-head'; nodeId: string }
  | { type: 'delete-tail'; nodeId: string }
  | { type: 'delete-node'; nodeId: string; index: number }
  | { type: 'search'; nodeId: string; found: boolean; index?: number }
  | { type: 'reverse-step'; swapNodes: [string, string] }
  | { type: 'update-pointers'; fromId: string; toId: string | null; pointerType: 'next' | 'prev' }
  | { type: 'done'; list: LinkedListNode | null; operation: string; stats?: object };

// ==================== RED-BLACK TREE ====================

export type NodeColor = 'red' | 'black';

export interface RBTreeNode {
  id: string;
  value: number;
  color: NodeColor;
  left: RBTreeNode | null;
  right: RBTreeNode | null;
  parent?: RBTreeNode | null;
  x?: number;
  y?: number;
}

export type RBTreeStep =
  | { type: 'compare'; nodeId: string; value: number; searchValue: number; direction: 'left' | 'right' | 'found' }
  | { type: 'insert'; nodeId: string; value: number; color: NodeColor }
  | { type: 'recolor'; nodeId: string; fromColor: NodeColor; toColor: NodeColor }
  | { type: 'rotate-left'; pivotId: string; parentId: string }
  | { type: 'rotate-right'; pivotId: string; parentId: string }
  | { type: 'fix-violation'; nodeId: string; violationType: 'red-red' | 'black-height' }
  | { type: 'search'; nodeId: string; found: boolean }
  | { type: 'delete'; nodeId: string; value: number }
  | { type: 'delete-fixup'; nodeId: string; case: 1 | 2 | 3 | 4 }
  | { type: 'transplant'; removedId: string; replacementId: string | null }
  | { type: 'done'; tree: RBTreeNode | null; operation: string; stats?: object };

// Combined data structure step type
export type DataStructureStep = BSTStep | HeapStep | HashTableStep | AVLStep | LinkedListStep | RBTreeStep;

// Data structure types
export type DataStructureType = 'bst' | 'heap' | 'hashtable' | 'avl' | 'linkedlist' | 'rbtree';

// Operation types
export type DataStructureOperation = 'insert' | 'delete' | 'search' | 'build' | 'extract' | 'heapify';

// Hash table collision resolution strategies
export type CollisionStrategy = 'chaining' | 'linear-probing' | 'quadratic-probing' | 'double-hashing';

// Animation speed in milliseconds
export type AnimationSpeed = 50 | 100 | 200 | 400 | 800;

// Visual configuration
export interface VisualConfig {
  nodeRadius: number;
  levelHeight: number;
  siblingDistance: number;
  animationDuration: AnimationSpeed;
}

// Tree layout calculation result
export interface TreeLayout {
  nodes: Map<string, TreeNode>;
  width: number;
  height: number;
}

// Statistics for data structures
export interface DataStructureStats {
  size: number;
  height?: number;
  balance?: number;
  loadFactor?: number;
  collisions?: number;
  comparisons?: number;
  swaps?: number;
}