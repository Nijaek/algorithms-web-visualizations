import { ComplexityMeta } from "@/types/complexity";

export type AlgorithmCategory =
  | "sorting"
  | "pathfinding"
  | "graph"
  | "data-structures"
  | "machine-learning";

export type AccentColor = "fuchsia" | "cyan" | "green" | "purple" | "amber";

export interface AlgorithmEntry {
  id: string;
  name: string;
  category: AlgorithmCategory;
  complexity: ComplexityMeta;
  accentColor: AccentColor;
}

export interface CategoryMeta {
  slug: AlgorithmCategory;
  label: string;
  accentColor: AccentColor;
  defaultAlgorithm: string;
}

// ── Category metadata ──────────────────────────────────────────────

export const categories: CategoryMeta[] = [
  {
    slug: "data-structures",
    label: "Data Structures",
    accentColor: "purple",
    defaultAlgorithm: "binary-search-tree",
  },
  {
    slug: "sorting",
    label: "Sorting",
    accentColor: "fuchsia",
    defaultAlgorithm: "merge-sort",
  },
  {
    slug: "pathfinding",
    label: "Pathfinding",
    accentColor: "cyan",
    defaultAlgorithm: "dijkstra",
  },
  {
    slug: "graph",
    label: "Graph",
    accentColor: "green",
    defaultAlgorithm: "prim-mst",
  },
  {
    slug: "machine-learning",
    label: "Machine Learning",
    accentColor: "amber",
    defaultAlgorithm: "k-means",
  },
];

// ── All 27 algorithms ──────────────────────────────────────────────

export const algorithms: AlgorithmEntry[] = [
  // ── Sorting (6) ──
  {
    id: "merge-sort",
    name: "Merge Sort",
    category: "sorting",
    accentColor: "fuchsia",
    complexity: {
      name: "Merge Sort",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
      description:
        "Stable divide-and-conquer sort that splits, sorts recursively, then merges sorted halves.",
    },
  },
  {
    id: "quick-sort",
    name: "Quick Sort",
    category: "sorting",
    accentColor: "fuchsia",
    complexity: {
      name: "Quick Sort",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n\u00B2)",
      description:
        "Partition-based sort that recursively orders elements around pivots; fast in practice but quadratic on bad pivots.",
    },
  },
  {
    id: "heap-sort",
    name: "Heap Sort",
    category: "sorting",
    accentColor: "fuchsia",
    complexity: {
      name: "Heap Sort",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
      description:
        "Builds a heap then repeatedly extracts max/min to produce a sorted array in-place.",
    },
  },
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    category: "sorting",
    accentColor: "fuchsia",
    complexity: {
      name: "Bubble Sort",
      best: "O(n)",
      average: "O(n\u00B2)",
      worst: "O(n\u00B2)",
      description:
        "Repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order.",
    },
  },
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    category: "sorting",
    accentColor: "fuchsia",
    complexity: {
      name: "Insertion Sort",
      best: "O(n)",
      average: "O(n\u00B2)",
      worst: "O(n\u00B2)",
      description:
        "Builds the final sorted array one item at a time by inserting each element into its proper position.",
    },
  },
  {
    id: "selection-sort",
    name: "Selection Sort",
    category: "sorting",
    accentColor: "fuchsia",
    complexity: {
      name: "Selection Sort",
      best: "O(n\u00B2)",
      average: "O(n\u00B2)",
      worst: "O(n\u00B2)",
      description:
        "Repeatedly finds the minimum element and places it at the beginning of the unsorted portion.",
    },
  },

  // ── Pathfinding (5) ──
  {
    id: "dijkstra",
    name: "Dijkstra",
    category: "pathfinding",
    accentColor: "cyan",
    complexity: {
      name: "Dijkstra (binary heap)",
      best: "O(E)",
      average: "O((V + E) log V)",
      worst: "O((V + E) log V)",
      description:
        "Finds shortest paths on weighted, non-negative graphs by expanding the lowest-distance frontier first.",
    },
  },
  {
    id: "a-star",
    name: "A* Search",
    category: "pathfinding",
    accentColor: "cyan",
    complexity: {
      name: "A* Search (Manhattan)",
      best: "O(E)",
      average: "O(E log V)",
      worst: "O(E log V)",
      description:
        "Guided shortest-path search using a heuristic to prioritize nodes estimated closest to the goal.",
    },
  },
  {
    id: "bfs-pathfinding",
    name: "BFS",
    category: "pathfinding",
    accentColor: "cyan",
    complexity: {
      name: "Breadth-First Search",
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)",
      description:
        "Unweighted shortest path by exploring all neighbors at current depth before moving deeper.",
    },
  },
  {
    id: "dfs-pathfinding",
    name: "DFS",
    category: "pathfinding",
    accentColor: "cyan",
    complexity: {
      name: "Depth-First Search",
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)",
      description:
        "Explores as far as possible along each branch before backtracking. Does not guarantee shortest path.",
    },
  },
  {
    id: "greedy-best-first",
    name: "Greedy Best-First",
    category: "pathfinding",
    accentColor: "cyan",
    complexity: {
      name: "Greedy Best-First Search",
      best: "O(E)",
      average: "O(E log V)",
      worst: "O(E log V)",
      description:
        "Heuristic search that always expands the node closest to the goal. Fast but not optimal.",
    },
  },

  // ── Graph (5) ──
  {
    id: "prim-mst",
    name: "Prim's MST",
    category: "graph",
    accentColor: "green",
    complexity: {
      name: "Prim's MST",
      best: "O(E log V)",
      average: "O(E log V)",
      worst: "O(E log V)",
      description:
        "Finds a minimum spanning tree by adding the cheapest edge connecting the tree to a new vertex.",
    },
  },
  {
    id: "topological-sort",
    name: "Topological Sort",
    category: "graph",
    accentColor: "green",
    complexity: {
      name: "Topological Sort",
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)",
      description:
        "Linear ordering of vertices in a directed acyclic graph where each vertex appears before its outgoing edges.",
    },
  },
  {
    id: "bellman-ford",
    name: "Bellman-Ford",
    category: "graph",
    accentColor: "green",
    complexity: {
      name: "Bellman-Ford",
      best: "O(VE)",
      average: "O(VE)",
      worst: "O(VE)",
      description:
        "Single-source shortest path algorithm that handles negative weight edges and detects negative cycles.",
    },
  },
  {
    id: "bfs-graph",
    name: "BFS",
    category: "graph",
    accentColor: "green",
    complexity: {
      name: "Breadth-First Search",
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)",
      description:
        "Graph traversal that explores all neighbors at the current depth before moving deeper.",
    },
  },
  {
    id: "dfs-graph",
    name: "DFS",
    category: "graph",
    accentColor: "green",
    complexity: {
      name: "Depth-First Search",
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)",
      description:
        "Graph traversal that explores as far as possible along each branch before backtracking.",
    },
  },

  // ── Data Structures (6) ──
  {
    id: "binary-search-tree",
    name: "Binary Search Tree",
    category: "data-structures",
    accentColor: "purple",
    complexity: {
      name: "Binary Search Tree",
      best: "O(log n)",
      average: "O(log n)",
      worst: "O(n)",
      description:
        "Binary tree data structure that maintains sorted order and enables efficient search, insertion, and deletion operations.",
    },
  },
  {
    id: "avl-tree",
    name: "AVL Tree",
    category: "data-structures",
    accentColor: "purple",
    complexity: {
      name: "AVL Tree",
      best: "O(log n)",
      average: "O(log n)",
      worst: "O(log n)",
      description:
        "Self-balancing binary search tree where the heights of the two child subtrees of any node differ by at most one.",
    },
  },
  {
    id: "red-black-tree",
    name: "Red-Black Tree",
    category: "data-structures",
    accentColor: "purple",
    complexity: {
      name: "Red-Black Tree",
      best: "O(log n)",
      average: "O(log n)",
      worst: "O(log n)",
      description:
        "Self-balancing BST using color properties to ensure O(log n) operations.",
    },
  },
  {
    id: "heap",
    name: "Heap",
    category: "data-structures",
    accentColor: "purple",
    complexity: {
      name: "Heap (Priority Queue)",
      best: "O(1)",
      average: "O(log n)",
      worst: "O(log n)",
      description:
        "Specialized tree-based structure that satisfies the heap property, commonly used for implementing priority queues.",
    },
  },
  {
    id: "hash-table",
    name: "Hash Table",
    category: "data-structures",
    accentColor: "purple",
    complexity: {
      name: "Hash Table",
      best: "O(1)",
      average: "O(1)",
      worst: "O(n)",
      description:
        "Data structure that maps keys to values using a hash function, providing efficient average-case performance for insertions and lookups.",
    },
  },
  {
    id: "linked-list",
    name: "Linked List",
    category: "data-structures",
    accentColor: "purple",
    complexity: {
      name: "Linked List",
      best: "O(1)",
      average: "O(n)",
      worst: "O(n)",
      description:
        "Linear data structure with nodes connected by pointers. O(1) head operations, O(n) search/access.",
    },
  },

  // ── Machine Learning (5) ──
  {
    id: "k-means",
    name: "K-Means Clustering",
    category: "machine-learning",
    accentColor: "amber",
    complexity: {
      name: "K-Means Clustering",
      best: "O(n k t)",
      average: "O(n k t)",
      worst: "O(n k t)",
      description:
        "Iteratively assigns points to nearest centroids and recenters them.",
    },
  },
  {
    id: "linear-regression",
    name: "Linear Regression",
    category: "machine-learning",
    accentColor: "amber",
    complexity: {
      name: "Linear Regression",
      best: "O(n)",
      average: "O(n t)",
      worst: "O(n t)",
      description:
        "Fits a line to data by minimizing squared error using gradient descent.",
    },
  },
  {
    id: "knn",
    name: "K-Nearest Neighbors",
    category: "machine-learning",
    accentColor: "amber",
    complexity: {
      name: "K-Nearest Neighbors",
      best: "O(n)",
      average: "O(n d)",
      worst: "O(n d)",
      description:
        "Classifies points based on majority vote of k nearest training examples.",
    },
  },
  {
    id: "decision-tree",
    name: "Decision Tree",
    category: "machine-learning",
    accentColor: "amber",
    complexity: {
      name: "Decision Tree",
      best: "O(n log n)",
      average: "O(n\u00B2 d)",
      worst: "O(n\u00B2 d)",
      description:
        "Recursively splits data using feature thresholds to create a tree classifier.",
    },
  },
  {
    id: "logistic-regression",
    name: "Logistic Regression",
    category: "machine-learning",
    accentColor: "amber",
    complexity: {
      name: "Logistic Regression",
      best: "O(n)",
      average: "O(n t)",
      worst: "O(n t)",
      description:
        "Binary classification using sigmoid function and gradient descent.",
    },
  },
];

// ── Lookup helpers ─────────────────────────────────────────────────

const byId = new Map(algorithms.map((a) => [a.id, a]));
const byCategory = new Map<AlgorithmCategory, AlgorithmEntry[]>();
for (const a of algorithms) {
  const list = byCategory.get(a.category) ?? [];
  list.push(a);
  byCategory.set(a.category, list);
}

export function getAlgorithm(id: string): AlgorithmEntry | undefined {
  return byId.get(id);
}

export function getAlgorithmsForCategory(
  category: AlgorithmCategory
): AlgorithmEntry[] {
  return byCategory.get(category) ?? [];
}

export function getCategoryMeta(
  slug: AlgorithmCategory
): CategoryMeta | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getAllSlugs(): { category: string; algorithm: string }[] {
  return algorithms.map((a) => ({
    category: a.category,
    algorithm: a.id,
  }));
}
