from __future__ import annotations

from typing import List, Tuple


def dijkstra(rows: int, cols: int) -> List[Tuple[int, int]]:
  # Placeholder: return straight-line path
  return [(i, i) for i in range(min(rows, cols))]


def benchmark(rows: int, cols: int) -> dict:
  path = dijkstra(rows, cols)
  return {
    "rows": rows,
    "cols": cols,
    "path_length": len(path),
    "algorithm": "dijkstra",
    "note": "placeholder metrics; replace with timing and visited counts"
  }
