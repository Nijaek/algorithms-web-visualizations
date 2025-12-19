import { Graph, GraphGenerator, GraphGeneratorType, GraphNode, GraphEdge } from '../types';
import { getGeneratorProperties } from '../utils/requirements';

export interface GraphGeneratorMetadata {
  type: GraphGeneratorType;
  directed: boolean;
  weighted: boolean;
  acyclic: boolean;
  connected: boolean;
  generate: (params: GraphGenerator) => Graph;
}

// Complete graph generator
export const completeGraphGenerator: GraphGeneratorMetadata = {
  type: 'complete',
  ...getGeneratorProperties('complete'),
  generate: (params: GraphGenerator): Graph => {
    const { numNodes, weighted = false } = params;
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const angleStep = (2 * Math.PI) / numNodes;

    // Create nodes in a circle
    for (let i = 0; i < numNodes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = Math.cos(angle) * 150 + 200;
      const y = Math.sin(angle) * 150 + 200;

      nodes.push({
        id: i,
        label: i.toString(),
        position: { x, y }
      });
    }

    // Create edges between all pairs of nodes
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        edges.push({
          from: i,
          to: j,
          ...(weighted && { weight: Math.floor(Math.random() * 20) + 1 }),
          directed: false
        });
      }
    }

    return {
      nodes,
      edges,
      directed: false,
      weighted
    };
  }
};

// Tree generator
export const treeGenerator: GraphGeneratorMetadata = {
  type: 'tree',
  ...getGeneratorProperties('tree'),
  generate: (params: GraphGenerator): Graph => {
    const { numNodes, weighted = false } = params;
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Create root at center
    nodes.push({
      id: 0,
      label: '0',
      position: { x: 200, y: 200 }
    });

    // BFS to create tree
    const queue = [0];
    let nextNode = 1;

    while (queue.length > 0 && nextNode < numNodes) {
      const parent = queue.shift()!;
      const numChildren = Math.min(3, numNodes - nextNode);
      const parentPos = nodes[parent].position!;

      for (let i = 0; i < numChildren; i++) {
        const childId = nextNode++;
        const angle = (i - (numChildren - 1) / 2) * 0.5 + Math.atan2(
          parentPos.y - 200, parentPos.x - 200
        );

        const distance = 100 + (Math.random() - 0.5) * 40;
        const x = parentPos.x + Math.cos(angle) * distance;
        const y = parentPos.y + Math.sin(angle) * distance;

        nodes.push({
          id: childId,
          label: childId.toString(),
          position: { x, y }
        });

        edges.push({
          from: parent,
          to: childId,
          ...(weighted && { weight: 1 }),
          directed: false
        });

        queue.push(childId);
      }
    }

    return {
      nodes,
      edges,
      directed: false,
      weighted
    };
  }
};

// DAG generator
export const dagGenerator: GraphGeneratorMetadata = {
  type: 'dag',
  ...getGeneratorProperties('dag'),
  generate: (params: GraphGenerator): Graph => {
    const { numNodes, weighted = false } = params;
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const layers = Math.ceil(Math.sqrt(numNodes));
    const nodesPerLayer = Math.ceil(numNodes / layers);

    // Create nodes in layers
    for (let i = 0; i < numNodes; i++) {
      const layer = Math.floor(i / nodesPerLayer);
      const posInLayer = i % nodesPerLayer;
      const x = (posInLayer + 1) * (400 / (nodesPerLayer + 1));
      const y = (layer + 1) * (400 / (layers + 1));

      nodes.push({
        id: i,
        label: i.toString(),
        position: { x, y }
      });
    }

    // Create a clean, well-connected DAG with minimal edge clutter
    for (let i = 0; i < numNodes; i++) {
      const layerI = Math.floor(i / nodesPerLayer);

      // If not in the last layer, create exactly 1-2 edges to the next layer
      if (layerI < layers - 1) {
        const nextLayerStart = (layerI + 1) * nodesPerLayer;
        const nextLayerEnd = Math.min((layerI + 2) * nodesPerLayer, numNodes);

        // Create 1-2 edges to next layer (fewer edges for cleaner look)
        const numTargets = Math.random() < 0.7 ? 1 : 2; // 70% chance of 1 edge, 30% chance of 2 edges
        const usedTargets = new Set<number>();

        for (let t = 0; t < numTargets && usedTargets.size < Math.min(2, nextLayerEnd - nextLayerStart); t++) {
          let targetNode;
          do {
            targetNode = nextLayerStart + Math.floor(Math.random() * (nextLayerEnd - nextLayerStart));
          } while (usedTargets.has(targetNode));

          usedTargets.add(targetNode);
          edges.push({
            from: i,
            to: targetNode,
            ...(weighted && { weight: Math.floor(Math.random() * 10) + 1 }),
            directed: true
          });
        }
      }

      // Occasionally add a skip connection (layer + 2) for more interesting paths, but very rarely
      if (layerI < layers - 2 && Math.random() < 0.05) { // Only 5% chance
        const targetLayer = layerI + 2;
        const targetLayerStart = targetLayer * nodesPerLayer;
        const targetLayerEnd = Math.min((targetLayer + 1) * nodesPerLayer, numNodes);

        if (targetLayerStart < numNodes) {
          const targetNode = targetLayerStart + Math.floor(Math.random() * (targetLayerEnd - targetLayerStart));
          edges.push({
            from: i,
            to: targetNode,
            ...(weighted && { weight: Math.floor(Math.random() * 10) + 1 }),
            directed: true
          });
        }
      }
    }

    // Ensure every node (except first layer) has at least one incoming edge
    for (let layer = 1; layer < layers; layer++) {
      const layerStart = layer * nodesPerLayer;
      const layerEnd = Math.min((layer + 1) * nodesPerLayer, numNodes);

      for (let j = layerStart; j < layerEnd; j++) {
        const hasIncoming = edges.some(e => e.to === j);

        if (!hasIncoming) {
          // Add an edge from a random node in a previous layer
          const prevLayer = layer - 1;
          const prevLayerStart = prevLayer * nodesPerLayer;
          const prevLayerEnd = Math.min((prevLayer + 1) * nodesPerLayer, numNodes);

          const fromNode = prevLayerStart + Math.floor(Math.random() * (prevLayerEnd - prevLayerStart));
          edges.push({
            from: fromNode,
            to: j,
            ...(weighted && { weight: Math.floor(Math.random() * 10) + 1 }),
            directed: true
          });
        }
      }
    }

    return {
      nodes,
      edges,
      directed: true,
      weighted
    };
  }
};

// Weighted random generator
export const weightedRandomGenerator: GraphGeneratorMetadata = {
  type: 'weighted-random',
  ...getGeneratorProperties('weighted-random'),
  generate: (params: GraphGenerator): Graph => {
    const { numNodes } = params;
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const angleStep = (2 * Math.PI) / numNodes;

    // Create nodes in a circle
    for (let i = 0; i < numNodes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = Math.cos(angle) * 150 + 200;
      const y = Math.sin(angle) * 150 + 200;

      nodes.push({
        id: i,
        label: i.toString(),
        position: { x, y }
      });
    }

    // Create random weighted edges
    const edgeDensity = 0.4; // 40% of possible edges
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        if (Math.random() < edgeDensity) {
          edges.push({
            from: i,
            to: j,
            weight: Math.floor(Math.random() * 20) + 1,
            directed: false
          });
        }
      }
    }

    return {
      nodes,
      edges,
      directed: false,
      weighted: true
    };
  }
};

// Grid generator
export const gridGenerator: GraphGeneratorMetadata = {
  type: 'grid',
  ...getGeneratorProperties('grid'),
  generate: (params: GraphGenerator): Graph => {
    const { numNodes } = params;
    const size = Math.ceil(Math.sqrt(numNodes));
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Create nodes in a grid
    for (let i = 0; i < numNodes; i++) {
      const row = Math.floor(i / size);
      const col = i % size;
      const x = (col + 1) * (400 / (size + 1));
      const y = (row + 1) * (400 / (size + 1));

      nodes.push({
        id: i,
        label: i.toString(),
        position: { x, y }
      });
    }

    // Create edges between adjacent nodes
    for (let i = 0; i < numNodes; i++) {
      const row = Math.floor(i / size);
      const col = i % size;

      // Right neighbor
      if (col < size - 1 && i + 1 < numNodes) {
        edges.push({
          from: i,
          to: i + 1,
          directed: false
        });
      }

      // Bottom neighbor
      if (row < size - 1 && i + size < numNodes) {
        edges.push({
          from: i,
          to: i + size,
          directed: false
        });
      }
    }

    return {
      nodes,
      edges,
      directed: false,
      weighted: false
    };
  }
};

// Custom generator (placeholder for user-defined graphs)
export const customGenerator: GraphGeneratorMetadata = {
  type: 'custom',
  ...getGeneratorProperties('custom'),
  generate: (params: GraphGenerator): Graph => {
    // Return empty graph for custom - users can modify this
    return {
      nodes: [],
      edges: [],
      directed: params.directed || false,
      weighted: params.weighted || false
    };
  }
};

// Export all generators
export const GRAPH_GENERATORS: Record<GraphGeneratorType, GraphGeneratorMetadata> = {
  complete: completeGraphGenerator,
  tree: treeGenerator,
  dag: dagGenerator,
  'weighted-random': weightedRandomGenerator,
  grid: gridGenerator,
  custom: customGenerator
};

// Helper function to get generator
export function getGraphGenerator(type: GraphGeneratorType): GraphGeneratorMetadata {
  return GRAPH_GENERATORS[type];
}

// Generate graph with validation
export function generateGraph(params: GraphGenerator): Graph {
  const generator = getGraphGenerator(params.type);
  return generator.generate(params);
}