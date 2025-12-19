import { LabeledPoint, DecisionTreeNode, DecisionTreeStep } from "../../types/ml";

let nodeIdCounter = 0;

function generateNodeId(): string {
  return `node-${nodeIdCounter++}`;
}

function calculateGini(points: LabeledPoint[]): number {
  if (points.length === 0) return 0;

  const labelCounts: Record<number, number> = {};
  for (const p of points) {
    labelCounts[p.label] = (labelCounts[p.label] || 0) + 1;
  }

  let gini = 1;
  const n = points.length;
  for (const count of Object.values(labelCounts)) {
    const p = count / n;
    gini -= p * p;
  }

  return gini;
}

function getMajorityLabel(points: LabeledPoint[]): number {
  const labelCounts: Record<number, number> = {};
  for (const p of points) {
    labelCounts[p.label] = (labelCounts[p.label] || 0) + 1;
  }

  let maxLabel = 0;
  let maxCount = 0;
  for (const [label, count] of Object.entries(labelCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxLabel = Number(label);
    }
  }

  return maxLabel;
}

function findBestSplit(
  points: LabeledPoint[],
  bounds: [number, number, number, number]
): { feature: number; threshold: number; gain: number } | null {
  if (points.length < 2) return null;

  const currentGini = calculateGini(points);
  let bestGain = 0;
  let bestFeature = 0;
  let bestThreshold = 0;

  // Try splits on both features (0 = x, 1 = y)
  for (const feature of [0, 1]) {
    const values = points.map((p) => (feature === 0 ? p.x : p.y)).sort((a, b) => a - b);

    // Try split points between unique values
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2;

      const left = points.filter((p) => (feature === 0 ? p.x : p.y) <= threshold);
      const right = points.filter((p) => (feature === 0 ? p.x : p.y) > threshold);

      if (left.length === 0 || right.length === 0) continue;

      const leftGini = calculateGini(left);
      const rightGini = calculateGini(right);

      // Weighted average gini
      const weightedGini = (left.length * leftGini + right.length * rightGini) / points.length;
      const gain = currentGini - weightedGini;

      if (gain > bestGain) {
        bestGain = gain;
        bestFeature = feature;
        bestThreshold = threshold;
      }
    }
  }

  if (bestGain <= 0) return null;

  return { feature: bestFeature, threshold: bestThreshold, gain: bestGain };
}

export function* decisionTreeSteps(
  points: LabeledPoint[],
  maxDepth = 4,
  minSamples = 3
): Generator<DecisionTreeStep, void, unknown> {
  nodeIdCounter = 0;

  yield { type: 'data', points };

  const regions: { bounds: [number, number, number, number]; label: number; samples: number }[] = [];

  function* buildTree(
    data: LabeledPoint[],
    depth: number,
    bounds: [number, number, number, number]
  ): Generator<DecisionTreeStep, DecisionTreeNode, unknown> {
    const gini = calculateGini(data);
    const prediction = getMajorityLabel(data);

    // Base cases: pure node, max depth, or too few samples
    if (gini === 0 || depth >= maxDepth || data.length < minSamples) {
      const node: DecisionTreeNode = {
        id: generateNodeId(),
        prediction,
        samples: data.length,
        impurity: gini
      };

      regions.push({ bounds, label: prediction, samples: data.length });
      yield { type: 'partition', regions: [...regions] };

      return node;
    }

    // Find best split
    const split = findBestSplit(data, bounds);

    if (!split) {
      const node: DecisionTreeNode = {
        id: generateNodeId(),
        prediction,
        samples: data.length,
        impurity: gini
      };

      regions.push({ bounds, label: prediction, samples: data.length });
      yield { type: 'partition', regions: [...regions] };

      return node;
    }

    const node: DecisionTreeNode = {
      id: generateNodeId(),
      feature: split.feature,
      threshold: split.threshold,
      samples: data.length,
      impurity: gini
    };

    yield { type: 'split', node, feature: split.feature, threshold: split.threshold, gain: split.gain };

    // Split data
    const leftData = data.filter((p) =>
      (split.feature === 0 ? p.x : p.y) <= split.threshold
    );
    const rightData = data.filter((p) =>
      (split.feature === 0 ? p.x : p.y) > split.threshold
    );

    // Calculate new bounds
    const leftBounds: [number, number, number, number] = [...bounds] as [number, number, number, number];
    const rightBounds: [number, number, number, number] = [...bounds] as [number, number, number, number];

    if (split.feature === 0) {
      leftBounds[2] = split.threshold;  // maxX
      rightBounds[0] = split.threshold; // minX
    } else {
      leftBounds[3] = split.threshold;  // maxY
      rightBounds[1] = split.threshold; // minY
    }

    // Recurse
    node.left = yield* buildTree(leftData, depth + 1, leftBounds);
    node.right = yield* buildTree(rightData, depth + 1, rightBounds);

    return node;
  }

  const tree = yield* buildTree(points, 0, [0, 0, 1, 1]);

  // Calculate accuracy
  let correct = 0;
  for (const point of points) {
    let node = tree;
    while (node.left && node.right && node.feature !== undefined && node.threshold !== undefined) {
      const value = node.feature === 0 ? point.x : point.y;
      node = value <= node.threshold ? node.left : node.right;
    }
    if (node.prediction === point.label) {
      correct++;
    }
  }

  const accuracy = correct / points.length;

  yield { type: 'done', tree, accuracy, regions };
}

export { generateClassificationData } from "./knn";
