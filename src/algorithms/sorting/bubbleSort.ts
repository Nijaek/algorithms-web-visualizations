import { SortingStep } from "../../types/algorithms";

export function* bubbleSortSteps(data: number[]): Generator<SortingStep, void, unknown> {
  const arr = [...data];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    // Last i elements are already in place
    for (let j = 0; j < n - i - 1; j++) {
      // Compare adjacent elements
      yield { type: "compare", indices: [j, j + 1] };

      if (arr[j] > arr[j + 1]) {
        // Swap if they are in wrong order
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        yield { type: "swap", indices: [j, j + 1] };
        swapped = true;
      }
    }

    // If no swapping occurred, array is already sorted
    if (!swapped) {
      break;
    }
  }

  yield { type: "done", array: arr };
}