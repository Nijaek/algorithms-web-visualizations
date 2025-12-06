import { PathfindingStep } from "../../types/algorithms";
import { dijkstraSteps } from "./dijkstra";

export function* aStarSteps(rows = 12, cols = 18): Generator<PathfindingStep, void, unknown> {
  // For the scaffold, reuse the Dijkstra stepping behavior to keep visuals consistent.
  yield* dijkstraSteps(rows, cols);
}
