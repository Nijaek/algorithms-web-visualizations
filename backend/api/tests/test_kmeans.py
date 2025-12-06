from django.test import SimpleTestCase

from api.algorithms import kmeans


class KMeansTests(SimpleTestCase):
  def test_generate_points_count(self):
    points = kmeans.generate_points(10)
    self.assertEqual(len(points), 10)
