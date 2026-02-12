"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAlgorithm } from "@/contexts/AlgorithmContext";
import {
  VisualizerLayout,
  AlgorithmPills,
  ControlPanel,
  PlaybackControls,
  SpeedSlider,
  RangeSlider,
  StepCounter,
  VisualizationCanvas,
} from "@/components/ui";
import { getAlgorithm, getAlgorithmsForCategory } from "@/data/algorithm-registry";
import { SortingStep } from "@/types/algorithms";
import { mergeSortSteps } from "@/algorithms/sorting/mergeSort";
import { quickSortSteps } from "@/algorithms/sorting/quickSort";
import { heapSortSteps } from "@/algorithms/sorting/heapSort";
import { bubbleSortSteps } from "@/algorithms/sorting/bubbleSort";
import { insertionSortSteps } from "@/algorithms/sorting/insertionSort";
import { selectionSortSteps } from "@/algorithms/sorting/selectionSort";

type SortingAlgorithmKey =
  | "merge-sort"
  | "quick-sort"
  | "heap-sort"
  | "bubble-sort"
  | "insertion-sort"
  | "selection-sort";

const algorithmGenerators: Record<
  SortingAlgorithmKey,
  (arr: number[]) => Generator<SortingStep>
> = {
  "merge-sort": mergeSortSteps,
  "quick-sort": quickSortSteps,
  "heap-sort": heapSortSteps,
  "bubble-sort": bubbleSortSteps,
  "insertion-sort": insertionSortSteps,
  "selection-sort": selectionSortSteps,
};

const sortingAlgorithms = getAlgorithmsForCategory("sorting").map((a) => ({
  key: a.id,
  label: a.name,
}));

const colors = ["#ff2d95", "#2de2e6", "#f8d210", "#3df29b", "#7c3aed", "#f97316"];

const generateArray = (size: number) =>
  Array.from({ length: size }, () => 5 + Math.floor(Math.random() * 95));

function applyStep(array: number[], step: SortingStep): number[] {
  const next = [...array];
  if (step.type === "swap") {
    const [i, j] = step.indices;
    [next[i], next[j]] = [next[j], next[i]];
  }
  if (step.type === "overwrite") {
    next[step.index] = step.value;
  }
  if (step.type === "done") {
    return [...step.array];
  }
  return next;
}

interface SortingVisualizerClientProps {
  initialAlgorithm: string;
}

export default function SortingVisualizerClient({
  initialAlgorithm,
}: SortingVisualizerClientProps) {
  const router = useRouter();
  const { setComplexity } = useAlgorithm();
  const [algorithm, setAlgorithmState] = useState(initialAlgorithm);
  const [size, setSize] = useState(42);
  const [baseArray, setBaseArray] = useState<number[]>(() => generateArray(42));
  const [displayArray, setDisplayArray] = useState<number[]>(baseArray);
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(40);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const maxValue = useMemo(
    () => Math.max(...displayArray, 100),
    [displayArray]
  );

  const handleAlgorithmChange = (key: string) => {
    setAlgorithmState(key);
    router.push(`/sorting/${key}`, { scroll: false });
  };

  // Update complexity in context
  useEffect(() => {
    const entry = getAlgorithm(algorithm);
    if (entry) setComplexity(entry.complexity);
  }, [algorithm, setComplexity]);

  // Generate steps when algorithm or array changes
  useEffect(() => {
    const gen =
      algorithmGenerators[algorithm as SortingAlgorithmKey] ??
      algorithmGenerators["merge-sort"];
    const allSteps = Array.from(gen(baseArray));
    setSteps(allSteps);
    setDisplayArray([...baseArray]);
    setStepIndex(0);
    setIsPlaying(false);
    setActiveIndices([]);
    setIsComplete(false);
  }, [algorithm, baseArray]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || stepIndex >= steps.length) {
      if (isPlaying) setIsPlaying(false);
      return;
    }
    const id = window.setTimeout(() => stepForward(), speed);
    return () => window.clearTimeout(id);
  }, [isPlaying, stepIndex, steps, speed]);

  const stepForward = () => {
    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      return;
    }
    const step = steps[stepIndex];
    setDisplayArray((prev) => applyStep(prev, step));
    if (step.type === "compare" || step.type === "swap") {
      setActiveIndices(step.indices as number[]);
    } else if (step.type === "overwrite") {
      setActiveIndices([step.index]);
    } else if (step.type === "done") {
      setActiveIndices([]);
      setIsComplete(true);
      setIsPlaying(false);
    } else {
      setActiveIndices([]);
    }
    setStepIndex((idx) => idx + 1);
  };

  const handleReset = () => {
    const arr = generateArray(size);
    setBaseArray(arr);
  };

  const handleRun = () => {
    setDisplayArray([...baseArray]);
    setStepIndex(0);
    setActiveIndices([]);
    setIsComplete(false);
    setIsPlaying(true);
  };

  return (
    <VisualizerLayout
      badge="Sorting"
      badgeColor="fuchsia"
      pills={
        <AlgorithmPills
          algorithms={sortingAlgorithms}
          active={algorithm}
          onChange={handleAlgorithmChange}
          accentColor="fuchsia"
        />
      }
      infoBar={
        <StepCounter
          items={[
            { label: "Steps", value: stepIndex },
            { label: "Size", value: displayArray.length },
            { label: "Speed", value: `${speed}ms` },
          ]}
          algorithmName={
            sortingAlgorithms.find((a) => a.key === algorithm)?.label
          }
        />
      }
      controls={
        <ControlPanel title="Controls">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlay={handleRun}
            onPause={() => setIsPlaying(false)}
            onStep={stepForward}
            onReset={handleReset}
            canStep={stepIndex < steps.length}
            canReset={true}
            totalSteps={steps.length}
            currentStep={stepIndex}
          />
          <SpeedSlider
            value={speed}
            onChange={setSpeed}
            min={10}
            max={200}
          />
          <RangeSlider
            label="Array size"
            value={size}
            onChange={(next) => {
              setSize(next);
              setBaseArray(generateArray(next));
            }}
            min={10}
            max={90}
          />
        </ControlPanel>
      }
    >
      <VisualizationCanvas>
        <div className="flex h-full items-end gap-[2px]">
          {displayArray.map((value, idx) => {
            const height = `${(value / maxValue) * 100}%`;
            const isActive = activeIndices.includes(idx);
            const color = colors[idx % colors.length];
            return (
              <div
                key={idx}
                className="flex-1 rounded-t transition-all duration-200"
                style={{
                  height,
                  background: isComplete
                    ? "linear-gradient(180deg, #10b981, #059669)"
                    : isActive
                      ? "linear-gradient(180deg, #2de2e6, #ff2d95)"
                      : `linear-gradient(180deg, ${color}, #111827)`,
                }}
                title={`${value}`}
              />
            );
          })}
        </div>
      </VisualizationCanvas>
    </VisualizerLayout>
  );
}
