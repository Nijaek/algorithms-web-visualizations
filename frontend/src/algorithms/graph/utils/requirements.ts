import { AlgorithmRequirements, GraphGeneratorType } from '../types';

export const ALGORITHM_REQUIREMENTS: Record<string, AlgorithmRequirements> = {
  'bellman-ford': {
    requiresDirected: true,
    requiresWeighted: true,
    incompatibleGenerators: ['tree', 'complete']
  },
  'prim-mst': {
    requiresWeighted: true,
    requiresConnected: true,
    incompatibleGenerators: ['dag'] // DAG is directed
  },
  'topological-sort': {
    requiresDirected: true,
    requiresAcyclic: true,
    incompatibleGenerators: ['tree', 'complete', 'weighted-random']
  },
  'bfs': {
    supportsTargets: true,
    // Works with all graph types
  },
  'dfs': {
    supportsTargets: true,
    // Works with all graph types
  },
  'greedy': {
    supportsTargets: true,
    // Works with all graph types
  },
  'dijkstra': {
    requiresWeighted: true,
    supportsTargets: true,
    incompatibleGenerators: ['dag'] // Usually for non-negative weights
  }
};

// Compatibility checker
export function checkCompatibility(
  algorithm: string,
  generatorType: GraphGeneratorType
): { compatible: boolean; reason?: string } {
  const requirements = ALGORITHM_REQUIREMENTS[algorithm];
  if (!requirements) return { compatible: false, reason: 'Unknown algorithm' };

  if (requirements.incompatibleGenerators?.includes(generatorType)) {
    return {
      compatible: false,
      reason: `${generatorType} graphs are incompatible with ${algorithm}`
    };
  }

  return { compatible: true };
}

// Get compatible generator types for an algorithm
export function getCompatibleGenerators(algorithm: string): GraphGeneratorType[] {
  const allGenerators: GraphGeneratorType[] = [
    'complete', 'tree', 'dag', 'weighted-random', 'grid', 'custom'
  ];

  return allGenerators.filter(generator => {
    const { compatible } = checkCompatibility(algorithm, generator);
    return compatible;
  });
}

// Get algorithms compatible with a generator type
export function getCompatibleAlgorithms(generatorType: GraphGeneratorType): string[] {
  return Object.entries(ALGORITHM_REQUIREMENTS)
    .filter(([algorithm]) => {
      const { compatible } = checkCompatibility(algorithm, generatorType);
      return compatible;
    })
    .map(([algorithm]) => algorithm);
}

// Check if a generator type supports specific properties
export function getGeneratorProperties(generatorType: GraphGeneratorType): {
  directed: boolean;
  weighted: boolean;
  acyclic: boolean;
  connected: boolean;
} {
  switch (generatorType) {
    case 'complete':
      return {
        directed: false,
        weighted: true, // Can be weighted
        acyclic: false,
        connected: true
      };
    case 'tree':
      return {
        directed: false,
        weighted: true, // Can be weighted
        acyclic: true,
        connected: true
      };
    case 'dag':
      return {
        directed: true,
        weighted: true, // Can be weighted
        acyclic: true,
        connected: false // May not be connected
      };
    case 'weighted-random':
      return {
        directed: false,
        weighted: true,
        acyclic: false,
        connected: true
      };
    case 'grid':
      return {
        directed: false,
        weighted: false,
        acyclic: true,
        connected: true
      };
    case 'custom':
      return {
        directed: false, // Can be either
        weighted: false, // Can be either
        acyclic: false, // Can be either
        connected: false // Can be either
      };
    default:
      return {
        directed: false,
        weighted: false,
        acyclic: false,
        connected: false
      };
  }
}