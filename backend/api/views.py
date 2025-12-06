from typing import Any, Dict

from django.http import JsonResponse
from rest_framework.decorators import api_view

from .algorithms import kmeans, pathfinding, sorting


@api_view(["GET"])
def list_algorithms(_request):
  data = {
    "sorting": ["merge_sort", "quick_sort", "heap_sort"],
    "pathfinding": ["dijkstra", "a_star"],
    "kmeans": ["k_means"]
  }
  return JsonResponse(data)


@api_view(["POST"])
def sorting_benchmark(request):
  payload: Dict[str, Any] = request.data if isinstance(request.data, dict) else {}
  size = int(payload.get("size", 1000))
  items = sorting.generate_random_array(size)
  metrics = sorting.benchmark(items)
  return JsonResponse(metrics)


@api_view(["POST"])
def pathfinding_benchmark(request):
  payload: Dict[str, Any] = request.data if isinstance(request.data, dict) else {}
  rows = int(payload.get("rows", 10))
  cols = int(payload.get("cols", 10))
  metrics = pathfinding.benchmark(rows, cols)
  return JsonResponse(metrics)


@api_view(["POST"])
def kmeans_benchmark(request):
  payload: Dict[str, Any] = request.data if isinstance(request.data, dict) else {}
  points = int(payload.get("points", 200))
  clusters = int(payload.get("clusters", 3))
  metrics = kmeans.benchmark(points, clusters)
  return JsonResponse(metrics)
