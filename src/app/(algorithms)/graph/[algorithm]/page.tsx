import { notFound } from "next/navigation";
import { getAlgorithmsForCategory } from "@/data/algorithm-registry";
import GraphVisualizerClient from "./GraphVisualizerClient";

export function generateStaticParams() {
  return getAlgorithmsForCategory("graph").map((a) => ({
    algorithm: a.id,
  }));
}

export default function GraphAlgorithmPage({
  params,
}: {
  params: { algorithm: string };
}) {
  const algorithms = getAlgorithmsForCategory("graph");
  const entry = algorithms.find((a) => a.id === params.algorithm);
  if (!entry) notFound();

  return <GraphVisualizerClient initialAlgorithm={params.algorithm} />;
}
