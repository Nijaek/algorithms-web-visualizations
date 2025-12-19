import { SortingStep } from "../../types/algorithms";

function swap(arr: number[], i: number, j: number): SortingStep[] {
  [arr[i], arr[j]] = [arr[j], arr[i]];
  return [{ type: "swap", indices: [i, j] }];
}

export function* quickSortSteps(data: number[]): Generator<SortingStep, void, unknown> {
  const arr = [...data];
  const stack: Array<{ left: number; right: number }> = [{ left: 0, right: arr.length - 1 }];

  while (stack.length) {
    const { left, right } = stack.pop()!;
    if (left >= right) continue;

    const pivotIndex = right;
    const pivot = arr[pivotIndex];
    let store = left;

    for (let i = left; i < right; i += 1) {
      yield { type: "compare", indices: [i, pivotIndex] };
      if (arr[i] < pivot) {
        for (const step of swap(arr, i, store)) {
          yield step;
        }
        store += 1;
      }
    }

    for (const step of swap(arr, store, pivotIndex)) {
      yield step;
    }

    stack.push({ left, right: store - 1 });
    stack.push({ left: store + 1, right });
  }

  yield { type: "done", array: arr };
}
