import { Point2D, LinearRegressionStep } from "../../types/ml";

export function generateRegressionData(
  count = 50,
  slope = 0.7,
  intercept = 0.15,
  noise = 0.1
): Point2D[] {
  return Array.from({ length: count }, () => {
    const x = Math.random();
    const y = slope * x + intercept + (Math.random() - 0.5) * noise * 2;
    return { x, y: Math.max(0, Math.min(1, y)) };
  });
}

function calculateLoss(points: Point2D[], slope: number, intercept: number): number {
  const n = points.length;
  let sum = 0;
  for (const p of points) {
    const predicted = slope * p.x + intercept;
    sum += (predicted - p.y) ** 2;
  }
  return sum / n;
}

function calculateR2(points: Point2D[], slope: number, intercept: number): number {
  const n = points.length;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;

  let ssTot = 0;
  let ssRes = 0;

  for (const p of points) {
    const predicted = slope * p.x + intercept;
    ssTot += (p.y - meanY) ** 2;
    ssRes += (p.y - predicted) ** 2;
  }

  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

export function* linearRegressionSteps(
  points: Point2D[],
  learningRate = 0.5,
  iterations = 50
): Generator<LinearRegressionStep, void, unknown> {
  let slope = 0;
  let intercept = 0.5;
  const n = points.length;

  yield { type: 'init', points, slope, intercept };

  for (let i = 0; i < iterations; i++) {
    // Calculate gradients using partial derivatives
    let dSlope = 0;
    let dIntercept = 0;

    for (const p of points) {
      const predicted = slope * p.x + intercept;
      const error = predicted - p.y;
      dSlope += error * p.x;
      dIntercept += error;
    }

    dSlope = (2 / n) * dSlope;
    dIntercept = (2 / n) * dIntercept;

    // Update parameters
    slope -= learningRate * dSlope;
    intercept -= learningRate * dIntercept;

    const loss = calculateLoss(points, slope, intercept);

    yield { type: 'gradient', slope, intercept, loss, iteration: i + 1 };
  }

  const finalLoss = calculateLoss(points, slope, intercept);
  const r2 = calculateR2(points, slope, intercept);

  yield { type: 'done', slope, intercept, loss: finalLoss, r2 };
}
