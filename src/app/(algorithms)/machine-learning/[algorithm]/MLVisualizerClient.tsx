"use client";

import { useEffect } from "react";
import { useAlgorithm } from "@/contexts/AlgorithmContext";
import { getAlgorithm } from "@/data/algorithm-registry";
import MachineLearningVisualizer from "@/components/visualizers/MachineLearningVisualizer";

interface Props {
  initialAlgorithm: string;
}

const slugToMLKey: Record<string, string> = {
  "k-means": "kmeans",
  "linear-regression": "linear-regression",
  knn: "knn",
  "decision-tree": "decision-tree",
  "logistic-regression": "logistic-regression",
};

export default function MLVisualizerClient({ initialAlgorithm }: Props) {
  const { setComplexity } = useAlgorithm();

  useEffect(() => {
    const entry = getAlgorithm(initialAlgorithm);
    if (entry) setComplexity(entry.complexity);
  }, [initialAlgorithm, setComplexity]);

  return (
    <MachineLearningVisualizer
      onComplexityChange={setComplexity}
      initialAlgorithm={slugToMLKey[initialAlgorithm]}
    />
  );
}
