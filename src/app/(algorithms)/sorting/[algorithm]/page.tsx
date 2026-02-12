import { notFound } from "next/navigation";
import { getAlgorithmsForCategory } from "@/data/algorithm-registry";
import SortingVisualizerClient from "./SortingVisualizerClient";

export function generateStaticParams() {
  return getAlgorithmsForCategory("sorting").map((a) => ({
    algorithm: a.id,
  }));
}

export default function SortingAlgorithmPage({
  params,
}: {
  params: { algorithm: string };
}) {
  const algorithms = getAlgorithmsForCategory("sorting");
  const entry = algorithms.find((a) => a.id === params.algorithm);
  if (!entry) notFound();

  return <SortingVisualizerClient initialAlgorithm={params.algorithm} />;
}
