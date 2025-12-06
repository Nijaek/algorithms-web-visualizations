from __future__ import annotations

import random
from typing import List, Tuple


def generate_random_array(size: int) -> List[int]:
  rng = random.Random(42)
  return [rng.randint(0, size * 10) for _ in range(size)]


def merge_sort(data: List[int]) -> List[int]:
  if len(data) <= 1:
    return data
  mid = len(data) // 2
  left = merge_sort(data[:mid])
  right = merge_sort(data[mid:])
  return merge(left, right)


def merge(left: List[int], right: List[int]) -> List[int]:
  merged: List[int] = []
  i = j = 0
  while i < len(left) and j < len(right):
    if left[i] <= right[j]:
      merged.append(left[i])
      i += 1
    else:
      merged.append(right[j])
      j += 1
  merged.extend(left[i:])
  merged.extend(right[j:])
  return merged


def benchmark(items: List[int]) -> dict:
  sorted_items = merge_sort(items.copy())
  return {
    "input_size": len(items),
    "sorted_head": sorted_items[:5],
    "algorithm": "merge_sort",
    "note": "placeholder metrics; extend with timings and step counts"
  }
