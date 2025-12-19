// Common ML types
export interface Point2D {
  x: number;
  y: number;
}

export interface LabeledPoint extends Point2D {
  label: number;
  confidence?: number;
}

// K-Means (existing)
export type KMeansStep = {
  centroids: Point2D[];
  assignments: number[];
};

// Linear Regression
export type LinearRegressionStep =
  | { type: 'init'; points: Point2D[]; slope: number; intercept: number }
  | { type: 'gradient'; slope: number; intercept: number; loss: number; iteration: number }
  | { type: 'done'; slope: number; intercept: number; loss: number; r2: number };

// K-Nearest Neighbors
export type KNNStep =
  | { type: 'data'; points: LabeledPoint[] }
  | { type: 'query'; point: Point2D; k: number }
  | { type: 'distances'; point: Point2D; neighbors: LabeledPoint[]; distances: number[] }
  | { type: 'vote'; neighbors: LabeledPoint[]; prediction: number; confidence: number }
  | { type: 'done'; prediction: number; accuracy?: number };

// Decision Tree
export interface DecisionTreeNode {
  id: string;
  feature?: number;        // 0 = x, 1 = y
  threshold?: number;
  prediction?: number;
  samples: number;
  impurity: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
}

export type DecisionTreeStep =
  | { type: 'data'; points: LabeledPoint[] }
  | { type: 'split'; node: DecisionTreeNode; feature: number; threshold: number; gain: number }
  | { type: 'partition'; regions: { bounds: [number, number, number, number]; label: number; samples: number }[] }
  | { type: 'done'; tree: DecisionTreeNode; accuracy: number; regions: { bounds: [number, number, number, number]; label: number; samples: number }[] };

// Logistic Regression
export type LogisticRegressionStep =
  | { type: 'init'; points: LabeledPoint[]; weights: [number, number]; bias: number }
  | { type: 'gradient'; weights: [number, number]; bias: number; loss: number; iteration: number }
  | { type: 'done'; weights: [number, number]; bias: number; accuracy: number };

// ML Algorithm type for selector
export type MLAlgorithm = 'kmeans' | 'linear-regression' | 'knn' | 'decision-tree' | 'logistic-regression';

// Complexity metadata for each algorithm
export interface MLComplexityMeta {
  name: string;
  best: string;
  average: string;
  worst: string;
  description: string;
}

export const mlComplexity: Record<MLAlgorithm, MLComplexityMeta> = {
  'kmeans': {
    name: "K-Means Clustering",
    best: "O(n k t)",
    average: "O(n k t)",
    worst: "O(n k t)",
    description: "Iteratively assigns points to nearest centroids and recenters them."
  },
  'linear-regression': {
    name: "Linear Regression",
    best: "O(n)",
    average: "O(n t)",
    worst: "O(n t)",
    description: "Fits a line to data by minimizing squared error using gradient descent."
  },
  'knn': {
    name: "K-Nearest Neighbors",
    best: "O(n)",
    average: "O(n d)",
    worst: "O(n d)",
    description: "Classifies points based on majority vote of k nearest training examples."
  },
  'decision-tree': {
    name: "Decision Tree",
    best: "O(n log n)",
    average: "O(n² d)",
    worst: "O(n² d)",
    description: "Recursively splits data using feature thresholds to create a tree classifier."
  },
  'logistic-regression': {
    name: "Logistic Regression",
    best: "O(n)",
    average: "O(n t)",
    worst: "O(n t)",
    description: "Binary classification using sigmoid function and gradient descent."
  }
};
