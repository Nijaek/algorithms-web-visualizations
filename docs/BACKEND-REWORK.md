# Backend Decision Record

## Decision: Backend Removed

**Date**: December 2024
**Status**: Implemented

The backend has been **completely removed** from this project. This document explains the rationale behind this decision.

---

## Background

The original project scaffold included a Django REST Framework backend designed for algorithm benchmarking. However, as the application evolved into a comprehensive educational visualization platform, the backend became obsolete.

### What Was Removed

- **Backend folder**: Django REST Framework application
- **Placeholder endpoints**:
  - `GET /api/algorithms/` - Listed available algorithms
  - `POST /api/benchmark/sorting/` - Placeholder merge sort benchmark
  - `POST /api/benchmark/pathfinding/` - Placeholder Dijkstra benchmark
  - `POST /api/benchmark/kmeans/` - Placeholder K-Means benchmark
- **MetricsPanel component**: Frontend placeholder that displayed hardcoded benchmark values

---

## Rationale

### 1. All Algorithm Logic is Client-Side

The frontend is a fully self-contained React application with all algorithms implemented in TypeScript:

| Category | Algorithms | Implementation |
|----------|-----------|----------------|
| **Sorting** | Merge, Quick, Heap, Bubble, Insertion, Selection | TypeScript generators yielding steps |
| **Pathfinding** | Dijkstra, A*, BFS, DFS | Grid-based step generators |
| **Graph** | Prim's MST, Topological Sort, Bellman-Ford, BFS, DFS | Graph structure generators |
| **Data Structures** | BST, AVL Tree, Red-Black Tree, Heap, Hash Table, Linked List | Interactive operation handlers |
| **Machine Learning** | K-Means, Linear Regression, KNN, Decision Tree, Logistic Regression | Iterative step generators |

The frontend doesn't need a backend for visualization functionality.

### 2. Metric Mismatch

Different algorithm categories have fundamentally different metrics:

- **Sorting**: Comparisons, swaps, array size
- **Data Structures**: Tree height, balance factor, load factor (interactive operations, not benchmarkable)
- **Machine Learning**: Iterations, loss, accuracy, R² score

A uniform backend metric schema (steps, elapsed time, array size) didn't fit all categories.

### 3. Backend Was All Placeholders

All backend implementations were stubs with TODOs. No actual functionality would be lost by removing them.

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │  Sorting    │ │ Pathfinding │ │ Data Structures     ││
│  │  Visualizer │ │ Visualizer  │ │ Visualizer          ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │  Graph      │ │     ML      │ │   ComplexityInfo    ││
│  │  Visualizer │ │ Visualizer  │ │   (static display)  ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
                    ↑
            100% client-side
            No backend required
```

---

## Future Considerations

If the application grows to need server-side features, consider:

1. **User Accounts**: Save favorite visualizations, track learning progress
2. **Sharing**: Generate shareable links to specific algorithm states
3. **Educational Content API**: Serve code examples in multiple languages
4. **Classroom Mode**: Real-time sync for teaching scenarios
5. **Code Sandbox**: Execute user-submitted algorithm implementations

These would justify reintroducing a backend. Until then, the application remains a lightweight, fully client-side educational tool.

---

## Files Changed

### Removed
- `backend/` - Entire Django backend folder
- `frontend/src/components/metrics/MetricsPanel.tsx` - Placeholder component

### Updated
- `frontend/src/App.tsx` - Removed MetricsPanel import and usage
- `README.md` - Updated to reflect frontend-only architecture
- `docker/` - Entire folder deleted (not needed for static frontend)
