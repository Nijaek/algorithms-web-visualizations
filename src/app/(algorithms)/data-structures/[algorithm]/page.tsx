import { notFound } from "next/navigation";
import { getAlgorithmsForCategory } from "@/data/algorithm-registry";
import DataStructureVisualizerClient from "./DataStructureVisualizerClient";

export function generateStaticParams() {
  return getAlgorithmsForCategory("data-structures").map((a) => ({
    algorithm: a.id,
  }));
}

export default function DataStructureAlgorithmPage({
  params,
}: {
  params: { algorithm: string };
}) {
  const algorithms = getAlgorithmsForCategory("data-structures");
  const entry = algorithms.find((a) => a.id === params.algorithm);
  if (!entry) notFound();

  return <DataStructureVisualizerClient initialAlgorithm={params.algorithm} />;
}
