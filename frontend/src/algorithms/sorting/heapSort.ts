import { SortingStep } from "../../types/algorithms";

function swap(arr: number[], i: number, j: number): SortingStep[] {
  [arr[i], arr[j]] = [arr[j], arr[i]];
  return [{ type: "swap", indices: [i, j] }];
}

function* heapify(arr: number[], length: number): Generator<SortingStep, void, unknown> {
  const parent = (i: number) => Math.floor((i - 1) / 2);
  const left = (i: number) => i * 2 + 1;
  const right = (i: number) => i * 2 + 2;

  for (let i = 1; i < length; i += 1) {
    let child = i;
    while (child > 0 && arr[child] > arr[parent(child)]) {
      yield { type: "compare", indices: [child, parent(child)] };
      for (const step of swap(arr, child, parent(child))) {
        yield step;
      }
      child = parent(child);
    }
  }

  for (let end = length - 1; end > 0; end -= 1) {
    for (const step of swap(arr, 0, end)) {
      yield step;
    }

    let root = 0;
    while (true) {
      const l = left(root);
      const r = right(root);
      let largest = root;

      if (l < end) {
        yield { type: "compare", indices: [largest, l] };
        if (arr[l] > arr[largest]) largest = l;
      }
      if (r < end) {
        yield { type: "compare", indices: [largest, r] };
        if (arr[r] > arr[largest]) largest = r;
      }
      if (largest === root) break;

      for (const step of swap(arr, root, largest)) {
        yield step;
      }
      root = largest;
    }
  }
}

export function* heapSortSteps(data: number[]): Generator<SortingStep, void, unknown> {
  const arr = [...data];
  for (const step of heapify(arr, arr.length)) {
    yield step;
  }
  yield { type: "done", array: arr };
}
