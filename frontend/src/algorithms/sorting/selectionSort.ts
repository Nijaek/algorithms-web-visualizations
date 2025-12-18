import { SortingStep } from "../../types/algorithms";

export function* selectionSortSteps(data: number[]): Generator<SortingStep, void, unknown> {
  const arr = [...data];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    // Find the minimum element in unsorted array
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      yield { type: "compare", indices: [minIdx, j] };

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    // Swap the found minimum element with the first element
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      yield { type: "swap", indices: [i, minIdx] };
    }
  }

  yield { type: "done", array: arr };
}