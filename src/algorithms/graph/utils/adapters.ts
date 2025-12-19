import { Graph, WeightedEdge } from '../types';

interface LegacyGraphNode {
  x: number;
  y: number;
  label: string;
  edges: Array<{ to: number; weight: number }>;
  outgoing: number[];
  incoming: number[];
}

// Convert legacy GraphNode[] to unified Graph format
export function legacyNodesToGraph(nodes: LegacyGraphNode[], directed: boolean = false, weighted: boolean = false): Graph {
  const graphNodes = nodes.map((node, index) => ({
    id: index,
    label: node.label,
    position: { x: node.x, y: node.y }
  }));

  const edges: any[] = [];

  if (directed) {
    // For directed graphs (DAG, Bellman-Ford)
    nodes.forEach((node, fromIndex) => {
      if (node.outgoing) {
        node.outgoing.forEach(toIndex => {
          edges.push({
            from: fromIndex,
            to: toIndex,
            directed: true
          });
        });
      } else if (node.edges) {
        node.edges.forEach(edge => {
          edges.push({
            from: fromIndex,
            to: edge.to,
            weight: edge.weight,
            directed: true
          });
        });
      }
    });
  } else {
    // For undirected graphs (Prim's MST, BFS/DFS)
    const edgeSet = new Set<string>();
    nodes.forEach((node, fromIndex) => {
      if (node.edges) {
        node.edges.forEach(edge => {
          const edgeKey = [Math.min(fromIndex, edge.to), Math.max(fromIndex, edge.to)].sort().join('-');
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({
              from: fromIndex,
              to: edge.to,
              weight: edge.weight || 1,
              directed: false
            });
          }
        });
      }
    });
  }

  return {
    nodes: graphNodes,
    edges,
    directed,
    weighted
  };
}

// Convert unified Graph to legacy GraphNode[] for visualization
export function graphToLegacyNodes(graph: Graph): LegacyGraphNode[] {
  const nodes: LegacyGraphNode[] = graph.nodes.map(node => ({
    x: node.position?.x || 0,
    y: node.position?.y || 0,
    label: node.label || node.id.toString(),
    edges: [],
    outgoing: [],
    incoming: []
  }));

  // Create adjacency lists
  graph.edges.forEach(edge => {
    const fromIndex = typeof edge.from === 'number' ? edge.from : graph.nodes.findIndex(n => n.id === edge.from);
    const toIndex = typeof edge.to === 'number' ? edge.to : graph.nodes.findIndex(n => n.id === edge.to);

    if (fromIndex !== -1 && toIndex !== -1) {
      const weight = edge.weight || 1;
      nodes[fromIndex].edges.push({ to: toIndex, weight });

      // For directed graphs, also track outgoing/incoming
      if (edge.directed) {
        nodes[fromIndex].outgoing!.push(toIndex);
        nodes[toIndex].incoming!.push(fromIndex);
      }

      if (!edge.directed) {
        nodes[toIndex].edges.push({ to: fromIndex, weight });
        nodes[toIndex].outgoing!.push(fromIndex);
        nodes[fromIndex].incoming!.push(toIndex);
      }
    }
  });

  return nodes;
}

// Convert WeightedEdge[] format to unified Graph
export function edgeListToGraph(numNodes: number, edges: WeightedEdge[], directed: boolean = true): Graph {
  const nodes = Array.from({ length: numNodes }, (_, i) => ({
    id: i,
    label: i.toString(),
    position: { // Position in a circle
      x: Math.cos((i / numNodes) * 2 * Math.PI - Math.PI / 2) * 150 + 200,
      y: Math.sin((i / numNodes) * 2 * Math.PI - Math.PI / 2) * 150 + 200
    }
  }));

  const graphEdges = edges.map(edge => ({
    from: edge.from,
    to: edge.to,
    weight: edge.weight,
    directed
  }));

  return {
    nodes,
    edges: graphEdges,
    directed,
    weighted: true
  };
}