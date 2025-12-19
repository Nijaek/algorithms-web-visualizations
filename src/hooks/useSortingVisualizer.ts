import { useState } from "react";
import { SortingStep } from "../types/algorithms";

export function useSortingVisualizer() {
  const [steps] = useState<SortingStep[]>([]);
  const [currentIndex] = useState(0);
  return { steps, currentIndex };
}
