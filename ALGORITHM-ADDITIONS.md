# Algorithm Additions for NeonAlgo Lab

## Prompt for LLM to Implement Additional Algorithms

You are tasked with implementing additional algorithms for the NeonAlgo Lab visualization platform. This platform provides interactive visualizations for various computer science algorithms with a React frontend and Django backend.

## Current Implementation Overview

The platform currently supports three algorithm categories:

1. **Sorting Algorithms**: Merge Sort, Quick Sort, Heap Sort
2. **Pathfinding Algorithms**: Dijkstra's Algorithm, A* Search
3. **Clustering Algorithms**: K-Means (Lloyd's algorithm)

## Implementation Requirements

### Frontend Implementation (TypeScript)

For each algorithm, you must create:

1. **Algorithm Implementation** (`frontend/src/algorithms/[category]/[algorithmName].ts`):
   - Implement as a generator function that yields visualization steps
   - Follow existing patterns for step types:
     - For sorting: `compare`, `swap`, `overwrite`, `done`
     - For pathfinding: `visited`, `frontier`, `path`
     - For other categories: define appropriate step types
   - Include proper TypeScript typing

2. **Update Type Definitions** (if needed):
   - Add new step types to `frontend/src/types/algorithms.ts` if required
   - Add complexity metadata to `frontend/src/App.tsx`

3. **Controls Component** (`frontend/src/components/controls/[Algorithm]Controls.tsx`):
   - Create UI controls specific to the algorithm
   - Include parameters that users can adjust
   - Follow existing styling patterns with Tailwind CSS

4. **Visualizer Component** (`frontend/src/components/visualizers/[Algorithm]Visualizer.tsx`):
   - Create visualization component that renders the algorithm steps
   - Use the existing hooks pattern (create a custom hook in `frontend/src/hooks/`)
   - Follow the dark theme with cyan accents

### Backend Implementation (Python)

For each algorithm, you must create:

1. **Algorithm Implementation** (`backend/api/algorithms/[category].py`):
   - Add the algorithm implementation to the appropriate category file
   - Include a benchmark function that returns performance metrics
   - Follow existing code style and patterns

2. **API Endpoints** (if needed):
   - Add new endpoints to `backend/api/urls.py` and `backend/api/views.py`
   - Create corresponding serializers in `backend/api/serializers.py`

3. **Tests** (`backend/api/tests/test_[category].py`):
   - Add test cases for the new algorithm implementation
   - Follow existing testing patterns

## Suggested Algorithms to Implement

### Sorting Algorithms
1. **Bubble Sort** - Simple comparison-based sort
2. **Insertion Sort** - Builds sorted array one item at a time
3. **Selection Sort** - Repeatedly finds minimum element
4. **Radix Sort** - Non-comparative integer sorting algorithm
5. **Counting Sort** - Integer sorting algorithm for small key ranges
6. **Shell Sort** - Generalization of insertion sort
7. **Tim Sort** - Hybrid stable sorting algorithm (used in Python)
8. **Comb Sort** - Improvement over bubble sort

### Pathfinding Algorithms
1. **Breadth-First Search (BFS)** - Unweighted shortest path
2. **Depth-First Search (DFS)** - Graph traversal algorithm
3. **Greedy Best-First Search** - Pathfinding using only heuristic
4. **Dijkstra's Algorithm (with Fibonacci Heap)** - Optimized version
5. **Jump Point Search** - Optimization for uniform-cost grids
6. **Floyd-Warshall Algorithm** - All-pairs shortest paths
7. **Bidirectional Search** - Search from both start and goal
8. **D* (Dynamic A*)** - For dynamic environments

### Graph Algorithms
1. **Minimum Spanning Tree (Prim's Algorithm)**
2. **Minimum Spanning Tree (Kruskal's Algorithm)**
3. **Topological Sort**
4. **Bellman-Ford Algorithm** - Shortest paths with negative weights
5. **Maximum Flow (Ford-Fulkerson)**
6. **Maximum Flow (Edmonds-Karp)**
7. **Strongly Connected Components (Kosaraju's Algorithm)**
8. **Graph Coloring**

### Data Structure Visualizations
1. **Binary Search Tree Operations** (Insert, Delete, Search)
2. **AVL Tree Rotations** (Self-balancing BST)
3. **Red-Black Tree Operations**
4. **Hash Table Operations** (Insert, Delete, Collision Resolution)
5. **Trie Operations** (Prefix tree)
6. **Heap Operations** (Insert, Extract-Max, Heapify)
7. **Disjoint Set Union (Union-Find)**
8. **Linked List Operations**

### Dynamic Programming
1. **Longest Common Subsequence**
2. **Knapsack Problem**
3. **Fibonacci Sequence (with memoization)**
4. **Coin Change Problem**
5. **Matrix Chain Multiplication**
6. **Edit Distance (Levenshtein Distance)**
7. **Subset Sum Problem**
8. **Palindrome Partitioning**

### String Algorithms
1. **Knuth-Morris-Pratt (KMP) Algorithm** - String matching
2. **Rabin-Karp Algorithm** - String matching with rolling hash
3. **Boyer-Moore Algorithm** - Efficient string searching
4. **Suffix Array Construction**
5. **Longest Prefix Suffix Array**
6. **Z-Algorithm** - Pattern matching
7. **Aho-Corasick Algorithm** - Multiple pattern matching
8. **Regular Expression Matching**

### Computational Geometry
1. **Convex Hull (Graham Scan)**
2. **Convex Hull (Jarvis March)**
3. **Line Segment Intersection**
4. **Closest Pair of Points**
5. **Voronoi Diagrams**
6. **Delaunay Triangulation**
7. **Line Clipping (Cohen-Sutherland)**
8. **Polygon Triangulation**

### Machine Learning Algorithms
1. **Linear Regression**
2. **Logistic Regression**
3. **Decision Trees**
4. **Random Forest**
5. **Naive Bayes Classifier**
6. **Support Vector Machines**
7. **Neural Network (Perceptron)**
8. **Principal Component Analysis (PCA)**

### Cryptography Algorithms
1. **RSA Algorithm**
2. **Diffie-Hellman Key Exchange**
3. **AES Encryption**
4. **Caesar Cipher**
5. **Vigenère Cipher**
6. **Hash Functions (SHA-256)**
7. **Digital Signatures**
8. **Elliptic Curve Cryptography**

## Implementation Priority

Please implement the algorithms in this order of priority:

1. **High Priority**: Complete the sorting category (add Bubble Sort, Insertion Sort, Selection Sort)
2. **Medium Priority**: Expand pathfinding (add BFS, DFS, Greedy Best-First Search)
3. **Medium Priority**: Add basic graph algorithms (Prim's MST, Kruskal's MST)
4. **Low Priority**: Implement more advanced algorithms from other categories

## Code Style Guidelines

- Follow the existing code style in the repository
- Use TypeScript for frontend implementations
- Use Python for backend implementations
- Include comprehensive comments for complex algorithms
- Ensure all visualizations are smooth and informative
- Add appropriate complexity information for each algorithm
- Include tests for all backend implementations

## Testing Requirements

- Frontend: Add component tests for new visualizers and controls
- Backend: Add unit tests for algorithm implementations
- Ensure all tests pass before submitting

## Documentation

- Update README.md with new algorithm descriptions
- Add inline documentation for complex algorithm steps
- Include complexity analysis for each algorithm

## Final Deliverables

For each algorithm implemented, provide:
1. Complete frontend implementation with visualization
2. Backend implementation with benchmarking
3. Appropriate UI controls
4. Tests
5. Updated documentation

Please ensure all implementations follow the existing patterns and maintain consistency with the current codebase architecture.