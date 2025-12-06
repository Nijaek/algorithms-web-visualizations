import { useState } from "react";
import { PathfindingStep } from "../types/algorithms";

export function usePathfindingVisualizer() {
  const [steps] = useState<PathfindingStep[]>([]);
  const [currentIndex] = useState(0);
  return { steps, currentIndex };
}
