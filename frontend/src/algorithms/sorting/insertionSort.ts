import { SortingStep } from "../../types/algorithms";

export function* insertionSortSteps(data: number[]): Generator<SortingStep, void, unknown> {
  const arr = [...data];
  const n = arr.length;

  // Start from the second element (index 1)
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    // Move elements of arr[0..i-1] that are greater than key
    // to one position ahead of their current position
    while (j >= 0) {
      yield { type: "compare", indices: [j, i] };

      if (arr[j] <= key) {
        break;
      }

      // Shift element to the right
      arr[j + 1] = arr[j];
      yield { type: "overwrite", index: j + 1, value: arr[j] };
      j -= 1;
    }

    // Place key at its correct position
    arr[j + 1] = key;
    if (j + 1 !== i) {
      yield { type: "overwrite", index: j + 1, value: key };
    }
  }

  yield { type: "done", array: arr };
}