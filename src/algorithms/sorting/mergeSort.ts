import { SortingStep } from "../../types/algorithms";

export function* mergeSortSteps(data: number[]): Generator<SortingStep, void, unknown> {
  const arr = [...data];
  const aux = [...data];
  const n = arr.length;

  for (let size = 1; size < n; size *= 2) {
    for (let left = 0; left < n - size; left += size * 2) {
      const mid = left + size;
      const right = Math.min(left + size * 2, n);

      let i = left;
      let j = mid;
      let k = left;

      while (i < mid && j < right) {
        yield { type: "compare", indices: [i, j] };
        if (arr[i] <= arr[j]) {
          aux[k] = arr[i];
          yield { type: "overwrite", index: k, value: arr[i] };
          i += 1;
        } else {
          aux[k] = arr[j];
          yield { type: "overwrite", index: k, value: arr[j] };
          j += 1;
        }
        k += 1;
      }

      while (i < mid) {
        aux[k] = arr[i];
        yield { type: "overwrite", index: k, value: arr[i] };
        i += 1;
        k += 1;
      }
      while (j < right) {
        aux[k] = arr[j];
        yield { type: "overwrite", index: k, value: arr[j] };
        j += 1;
        k += 1;
      }

      for (let t = left; t < right; t += 1) {
        arr[t] = aux[t];
      }
    }
  }

  yield { type: "done", array: arr };
}
