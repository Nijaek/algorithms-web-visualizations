import { notFound } from "next/navigation";
import { getAlgorithmsForCategory } from "@/data/algorithm-registry";
import MLVisualizerClient from "./MLVisualizerClient";

export function generateStaticParams() {
  return getAlgorithmsForCategory("machine-learning").map((a) => ({
    algorithm: a.id,
  }));
}

export default function MLAlgorithmPage({
  params,
}: {
  params: { algorithm: string };
}) {
  const algorithms = getAlgorithmsForCategory("machine-learning");
  const entry = algorithms.find((a) => a.id === params.algorithm);
  if (!entry) notFound();

  return <MLVisualizerClient initialAlgorithm={params.algorithm} />;
}
