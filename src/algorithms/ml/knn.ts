import { Point2D, LabeledPoint, KNNStep } from "../../types/ml";

export function generateClassificationData(
  count = 60,
  numClasses = 2,
  separation = 0.3
): LabeledPoint[] {
  const points: LabeledPoint[] = [];
  const centersX = numClasses === 2 ? [0.3, 0.7] : [0.25, 0.75, 0.5];
  const centersY = numClasses === 2 ? [0.3, 0.7] : [0.3, 0.3, 0.7];

  for (let i = 0; i < count; i++) {
    const label = i % numClasses;
    const cx = centersX[label];
    const cy = centersY[label];

    // Generate point around cluster center
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * separation;
    const x = Math.max(0.02, Math.min(0.98, cx + Math.cos(angle) * radius));
    const y = Math.max(0.02, Math.min(0.98, cy + Math.sin(angle) * radius));

    points.push({ x, y, label });
  }

  return points;
}

function euclideanDistance(a: Point2D, b: Point2D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function* knnSteps(
  data: LabeledPoint[],
  queryPoint: Point2D,
  k = 3
): Generator<KNNStep, void, unknown> {
  yield { type: 'data', points: data };
  yield { type: 'query', point: queryPoint, k };

  // Calculate distances to all points
  const withDistances = data.map((p) => ({
    point: p,
    distance: euclideanDistance(queryPoint, p)
  }));

  // Sort by distance
  withDistances.sort((a, b) => a.distance - b.distance);

  // Get k nearest neighbors
  const nearest = withDistances.slice(0, k);
  const neighbors = nearest.map((n) => n.point);
  const distances = nearest.map((n) => n.distance);

  yield { type: 'distances', point: queryPoint, neighbors, distances };

  // Vote for prediction
  const votes: Record<number, number> = {};
  for (const neighbor of neighbors) {
    votes[neighbor.label] = (votes[neighbor.label] || 0) + 1;
  }

  let prediction = 0;
  let maxVotes = 0;
  for (const [label, count] of Object.entries(votes)) {
    if (count > maxVotes) {
      maxVotes = count;
      prediction = Number(label);
    }
  }

  const confidence = maxVotes / k;

  yield { type: 'vote', neighbors, prediction, confidence };
  yield { type: 'done', prediction };
}

// For batch classification with accuracy calculation
export function* knnBatchSteps(
  trainingData: LabeledPoint[],
  testPoints: LabeledPoint[],
  k = 3
): Generator<KNNStep, void, unknown> {
  yield { type: 'data', points: trainingData };

  let correct = 0;

  for (const testPoint of testPoints) {
    yield { type: 'query', point: testPoint, k };

    // Calculate distances
    const withDistances = trainingData.map((p) => ({
      point: p,
      distance: euclideanDistance(testPoint, p)
    }));

    withDistances.sort((a, b) => a.distance - b.distance);

    const nearest = withDistances.slice(0, k);
    const neighbors = nearest.map((n) => n.point);
    const distances = nearest.map((n) => n.distance);

    yield { type: 'distances', point: testPoint, neighbors, distances };

    // Vote
    const votes: Record<number, number> = {};
    for (const neighbor of neighbors) {
      votes[neighbor.label] = (votes[neighbor.label] || 0) + 1;
    }

    let prediction = 0;
    let maxVotes = 0;
    for (const [label, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        prediction = Number(label);
      }
    }

    const confidence = maxVotes / k;
    yield { type: 'vote', neighbors, prediction, confidence };

    if (prediction === testPoint.label) {
      correct++;
    }
  }

  const accuracy = correct / testPoints.length;
  yield { type: 'done', prediction: 0, accuracy };
}
