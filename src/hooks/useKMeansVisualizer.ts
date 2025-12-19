import { useState } from "react";
import { KMeansStep } from "../types/algorithms";

export function useKMeansVisualizer() {
  const [steps] = useState<KMeansStep[]>([]);
  const [currentIndex] = useState(0);
  return { steps, currentIndex };
}
