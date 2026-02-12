import { notFound } from "next/navigation";
import { getAlgorithmsForCategory } from "@/data/algorithm-registry";
import PathfindingVisualizerClient from "./PathfindingVisualizerClient";

export function generateStaticParams() {
  return getAlgorithmsForCategory("pathfinding").map((a) => ({
    algorithm: a.id,
  }));
}

export default function PathfindingAlgorithmPage({
  params,
}: {
  params: { algorithm: string };
}) {
  const algorithms = getAlgorithmsForCategory("pathfinding");
  const entry = algorithms.find((a) => a.id === params.algorithm);
  if (!entry) notFound();

  return <PathfindingVisualizerClient initialAlgorithm={params.algorithm} />;
}
