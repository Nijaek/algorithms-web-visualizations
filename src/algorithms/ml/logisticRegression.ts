import { LabeledPoint, LogisticRegressionStep } from "../../types/ml";

export function generateBinaryClassificationData(
  count = 80,
  separation = 0.15
): LabeledPoint[] {
  const points: LabeledPoint[] = [];

  for (let i = 0; i < count; i++) {
    const label = i < count / 2 ? 0 : 1;

    // Generate points with some separation but overlap
    const baseX = label === 0 ? 0.35 : 0.65;
    const baseY = label === 0 ? 0.35 : 0.65;

    const x = Math.max(0.02, Math.min(0.98, baseX + (Math.random() - 0.5) * separation * 3));
    const y = Math.max(0.02, Math.min(0.98, baseY + (Math.random() - 0.5) * separation * 3));

    points.push({ x, y, label });
  }

  // Shuffle
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [points[i], points[j]] = [points[j], points[i]];
  }

  return points;
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function predict(x: number, y: number, weights: [number, number], bias: number): number {
  const z = weights[0] * x + weights[1] * y + bias;
  return sigmoid(z);
}

function calculateLoss(points: LabeledPoint[], weights: [number, number], bias: number): number {
  const n = points.length;
  let loss = 0;

  for (const p of points) {
    const prob = predict(p.x, p.y, weights, bias);
    // Binary cross-entropy loss with small epsilon to avoid log(0)
    const epsilon = 1e-15;
    const clippedProb = Math.max(epsilon, Math.min(1 - epsilon, prob));
    loss -= p.label * Math.log(clippedProb) + (1 - p.label) * Math.log(1 - clippedProb);
  }

  return loss / n;
}

export function* logisticRegressionSteps(
  points: LabeledPoint[],
  learningRate = 0.5,
  iterations = 60
): Generator<LogisticRegressionStep, void, unknown> {
  let weights: [number, number] = [0, 0];
  let bias = 0;
  const n = points.length;

  yield { type: 'init', points, weights: [...weights] as [number, number], bias };

  for (let i = 0; i < iterations; i++) {
    // Calculate gradients
    let dw0 = 0;
    let dw1 = 0;
    let db = 0;

    for (const p of points) {
      const prob = predict(p.x, p.y, weights, bias);
      const error = prob - p.label;
      dw0 += error * p.x;
      dw1 += error * p.y;
      db += error;
    }

    dw0 /= n;
    dw1 /= n;
    db /= n;

    // Update parameters
    weights[0] -= learningRate * dw0;
    weights[1] -= learningRate * dw1;
    bias -= learningRate * db;

    const loss = calculateLoss(points, weights, bias);

    yield {
      type: 'gradient',
      weights: [...weights] as [number, number],
      bias,
      loss,
      iteration: i + 1
    };
  }

  // Calculate final accuracy
  let correct = 0;
  for (const p of points) {
    const prob = predict(p.x, p.y, weights, bias);
    const predicted = prob >= 0.5 ? 1 : 0;
    if (predicted === p.label) {
      correct++;
    }
  }

  const accuracy = correct / n;

  yield {
    type: 'done',
    weights: [...weights] as [number, number],
    bias,
    accuracy
  };
}
