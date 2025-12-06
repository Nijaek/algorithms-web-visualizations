from django.urls import path

from . import views

urlpatterns = [
  path("algorithms/", views.list_algorithms, name="list-algorithms"),
  path("benchmark/sorting/", views.sorting_benchmark, name="benchmark-sorting"),
  path("benchmark/pathfinding/", views.pathfinding_benchmark, name="benchmark-pathfinding"),
  path("benchmark/kmeans/", views.kmeans_benchmark, name="benchmark-kmeans"),
]
