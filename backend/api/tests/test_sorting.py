from django.test import SimpleTestCase

from api.algorithms import sorting


class SortingTests(SimpleTestCase):
  def test_merge_sort_orders_numbers(self):
    data = [5, 1, 4, 2, 8]
    result = sorting.merge_sort(data)
    self.assertEqual(result, sorted(data))
