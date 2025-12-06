from django.test import SimpleTestCase

from api.algorithms import pathfinding


class PathfindingTests(SimpleTestCase):
  def test_dijkstra_returns_path(self):
    path = pathfinding.dijkstra(5, 5)
    self.assertTrue(path)
