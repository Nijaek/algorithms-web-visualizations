import { RBTreeNode, RBTreeStep, NodeColor } from '../../types/dataStructures';

// ==================== HELPER FUNCTIONS ====================

let rbNodeIdCounter = 0;

export function resetRBNodeIdCounter(): void {
  rbNodeIdCounter = 0;
}

export function createRBNode(value: number, color: NodeColor = 'red'): RBTreeNode {
  return {
    id: `rb-${rbNodeIdCounter++}`,
    value,
    color,
    left: null,
    right: null,
    parent: null
  };
}

export function cloneRBTree(node: RBTreeNode | null, parent: RBTreeNode | null = null): RBTreeNode | null {
  if (!node) return null;

  const cloned: RBTreeNode = {
    id: node.id,
    value: node.value,
    color: node.color,
    left: null,
    right: null,
    parent
  };

  cloned.left = cloneRBTree(node.left, cloned);
  cloned.right = cloneRBTree(node.right, cloned);

  return cloned;
}

export function findRBNode(root: RBTreeNode | null, id: string): RBTreeNode | null {
  if (!root) return null;
  if (root.id === id) return root;
  return findRBNode(root.left, id) || findRBNode(root.right, id);
}

function getGrandparent(node: RBTreeNode): RBTreeNode | null {
  return node.parent?.parent || null;
}

function getUncle(node: RBTreeNode): RBTreeNode | null {
  const grandparent = getGrandparent(node);
  if (!grandparent) return null;
  return node.parent === grandparent.left ? grandparent.right : grandparent.left;
}

function getSibling(node: RBTreeNode): RBTreeNode | null {
  if (!node.parent) return null;
  return node === node.parent.left ? node.parent.right : node.parent.left;
}

function getTreeHeight(node: RBTreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
}

function countNodes(node: RBTreeNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

// ==================== ROTATIONS ====================

function rotateLeft(root: RBTreeNode, node: RBTreeNode): RBTreeNode {
  const rightChild = node.right!;

  // Perform rotation
  node.right = rightChild.left;
  if (rightChild.left) {
    rightChild.left.parent = node;
  }

  rightChild.parent = node.parent;

  if (!node.parent) {
    root = rightChild;
  } else if (node === node.parent.left) {
    node.parent.left = rightChild;
  } else {
    node.parent.right = rightChild;
  }

  rightChild.left = node;
  node.parent = rightChild;

  return root;
}

function rotateRight(root: RBTreeNode, node: RBTreeNode): RBTreeNode {
  const leftChild = node.left!;

  // Perform rotation
  node.left = leftChild.right;
  if (leftChild.right) {
    leftChild.right.parent = node;
  }

  leftChild.parent = node.parent;

  if (!node.parent) {
    root = leftChild;
  } else if (node === node.parent.right) {
    node.parent.right = leftChild;
  } else {
    node.parent.left = leftChild;
  }

  leftChild.right = node;
  node.parent = leftChild;

  return root;
}

// ==================== INSERT ====================

export function* rbInsert(
  root: RBTreeNode | null,
  value: number
): Generator<RBTreeStep> {
  const newNode = createRBNode(value, 'red');

  // Standard BST insert
  if (!root) {
    newNode.color = 'black';
    yield { type: 'insert', nodeId: newNode.id, value, color: 'black' };
    yield { type: 'done', tree: newNode, operation: 'insert', stats: { size: 1, height: 1 } };
    return;
  }

  let current: RBTreeNode | null = root;
  let parent: RBTreeNode | null = null;

  // Find insertion point
  while (current) {
    parent = current;

    if (value < current.value) {
      yield { type: 'compare', nodeId: current.id, value: current.value, searchValue: value, direction: 'left' };
      current = current.left;
    } else if (value > current.value) {
      yield { type: 'compare', nodeId: current.id, value: current.value, searchValue: value, direction: 'right' };
      current = current.right;
    } else {
      // Duplicate value
      yield { type: 'compare', nodeId: current.id, value: current.value, searchValue: value, direction: 'found' };
      yield { type: 'done', tree: root, operation: 'insert', stats: { duplicate: true } };
      return;
    }
  }

  // Insert new node
  newNode.parent = parent;
  if (value < parent!.value) {
    parent!.left = newNode;
  } else {
    parent!.right = newNode;
  }

  yield { type: 'insert', nodeId: newNode.id, value, color: 'red' };

  // Fix Red-Black violations
  let node = newNode;
  let newRoot = root;

  while (node.parent && node.parent.color === 'red') {
    yield { type: 'fix-violation', nodeId: node.id, violationType: 'red-red' };

    const grandparent = getGrandparent(node);
    const uncle = getUncle(node);

    if (uncle && uncle.color === 'red') {
      // Case 1: Uncle is red - recolor
      yield { type: 'recolor', nodeId: node.parent.id, fromColor: 'red', toColor: 'black' };
      node.parent.color = 'black';

      yield { type: 'recolor', nodeId: uncle.id, fromColor: 'red', toColor: 'black' };
      uncle.color = 'black';

      yield { type: 'recolor', nodeId: grandparent!.id, fromColor: 'black', toColor: 'red' };
      grandparent!.color = 'red';

      node = grandparent!;
    } else {
      // Cases 2 & 3: Uncle is black - rotations needed
      if (node.parent === grandparent?.left) {
        if (node === node.parent.right) {
          // Case 2: Left-Right
          node = node.parent;
          yield { type: 'rotate-left', pivotId: node.right!.id, parentId: node.id };
          newRoot = rotateLeft(newRoot, node);
        }
        // Case 3: Left-Left
        yield { type: 'recolor', nodeId: node.parent!.id, fromColor: 'red', toColor: 'black' };
        node.parent!.color = 'black';

        yield { type: 'recolor', nodeId: grandparent!.id, fromColor: 'black', toColor: 'red' };
        grandparent!.color = 'red';

        yield { type: 'rotate-right', pivotId: node.parent!.id, parentId: grandparent!.id };
        newRoot = rotateRight(newRoot, grandparent!);
      } else {
        // Mirror cases for right side
        if (node === node.parent.left) {
          // Case 2: Right-Left
          node = node.parent;
          yield { type: 'rotate-right', pivotId: node.left!.id, parentId: node.id };
          newRoot = rotateRight(newRoot, node);
        }
        // Case 3: Right-Right
        yield { type: 'recolor', nodeId: node.parent!.id, fromColor: 'red', toColor: 'black' };
        node.parent!.color = 'black';

        yield { type: 'recolor', nodeId: grandparent!.id, fromColor: 'black', toColor: 'red' };
        grandparent!.color = 'red';

        yield { type: 'rotate-left', pivotId: node.parent!.id, parentId: grandparent!.id };
        newRoot = rotateLeft(newRoot, grandparent!);
      }
    }
  }

  // Ensure root is black
  if (newRoot.color === 'red') {
    yield { type: 'recolor', nodeId: newRoot.id, fromColor: 'red', toColor: 'black' };
    newRoot.color = 'black';
  }

  yield { type: 'done', tree: newRoot, operation: 'insert', stats: { size: countNodes(newRoot), height: getTreeHeight(newRoot) } };
}

// ==================== SEARCH ====================

export function* rbSearch(
  root: RBTreeNode | null,
  value: number
): Generator<RBTreeStep> {
  let current = root;

  while (current) {
    if (value === current.value) {
      yield { type: 'compare', nodeId: current.id, value: current.value, searchValue: value, direction: 'found' };
      yield { type: 'search', nodeId: current.id, found: true };
      yield { type: 'done', tree: root, operation: 'search', stats: { found: true } };
      return;
    }

    const direction = value < current.value ? 'left' : 'right';
    yield { type: 'compare', nodeId: current.id, value: current.value, searchValue: value, direction };

    current = value < current.value ? current.left : current.right;
  }

  yield { type: 'search', nodeId: '', found: false };
  yield { type: 'done', tree: root, operation: 'search', stats: { found: false } };
}

// ==================== DELETE ====================

function findMinimum(node: RBTreeNode): RBTreeNode {
  while (node.left) {
    node = node.left;
  }
  return node;
}

function transplant(root: RBTreeNode, u: RBTreeNode, v: RBTreeNode | null): RBTreeNode {
  if (!u.parent) {
    root = v!;
  } else if (u === u.parent.left) {
    u.parent.left = v;
  } else {
    u.parent.right = v;
  }
  if (v) {
    v.parent = u.parent;
  }
  return root;
}

function* deleteFixup(
  root: RBTreeNode,
  x: RBTreeNode | null,
  xParent: RBTreeNode | null
): Generator<RBTreeStep, RBTreeNode> {
  let newRoot = root;

  while (x !== newRoot && (!x || x.color === 'black')) {
    if (!xParent) break;

    if (x === xParent.left) {
      let w = xParent.right;

      if (w && w.color === 'red') {
        // Case 1
        yield { type: 'delete-fixup', nodeId: w.id, case: 1 };
        yield { type: 'recolor', nodeId: w.id, fromColor: 'red', toColor: 'black' };
        w.color = 'black';
        yield { type: 'recolor', nodeId: xParent.id, fromColor: 'black', toColor: 'red' };
        xParent.color = 'red';
        yield { type: 'rotate-left', pivotId: w.id, parentId: xParent.id };
        newRoot = rotateLeft(newRoot, xParent);
        w = xParent.right;
      }

      if (w && (!w.left || w.left.color === 'black') && (!w.right || w.right.color === 'black')) {
        // Case 2
        yield { type: 'delete-fixup', nodeId: w.id, case: 2 };
        yield { type: 'recolor', nodeId: w.id, fromColor: 'black', toColor: 'red' };
        w.color = 'red';
        x = xParent;
        xParent = x.parent ?? null;
      } else if (w) {
        if (!w.right || w.right.color === 'black') {
          // Case 3
          if (w.left) {
            yield { type: 'delete-fixup', nodeId: w.left.id, case: 3 };
            yield { type: 'recolor', nodeId: w.left.id, fromColor: 'red', toColor: 'black' };
            w.left.color = 'black';
          }
          yield { type: 'recolor', nodeId: w.id, fromColor: 'black', toColor: 'red' };
          w.color = 'red';
          yield { type: 'rotate-right', pivotId: w.left!.id, parentId: w.id };
          newRoot = rotateRight(newRoot, w);
          w = xParent.right;
        }
        // Case 4
        if (w) {
          yield { type: 'delete-fixup', nodeId: w.id, case: 4 };
          yield { type: 'recolor', nodeId: w.id, fromColor: w.color, toColor: xParent.color };
          w.color = xParent.color;
          yield { type: 'recolor', nodeId: xParent.id, fromColor: xParent.color, toColor: 'black' };
          xParent.color = 'black';
          if (w.right) {
            yield { type: 'recolor', nodeId: w.right.id, fromColor: 'red', toColor: 'black' };
            w.right.color = 'black';
          }
          yield { type: 'rotate-left', pivotId: w.id, parentId: xParent.id };
          newRoot = rotateLeft(newRoot, xParent);
        }
        x = newRoot;
        break;
      }
    } else {
      // Mirror cases
      let w = xParent.left;

      if (w && w.color === 'red') {
        // Case 1
        yield { type: 'delete-fixup', nodeId: w.id, case: 1 };
        yield { type: 'recolor', nodeId: w.id, fromColor: 'red', toColor: 'black' };
        w.color = 'black';
        yield { type: 'recolor', nodeId: xParent.id, fromColor: 'black', toColor: 'red' };
        xParent.color = 'red';
        yield { type: 'rotate-right', pivotId: w.id, parentId: xParent.id };
        newRoot = rotateRight(newRoot, xParent);
        w = xParent.left;
      }

      if (w && (!w.right || w.right.color === 'black') && (!w.left || w.left.color === 'black')) {
        // Case 2
        yield { type: 'delete-fixup', nodeId: w.id, case: 2 };
        yield { type: 'recolor', nodeId: w.id, fromColor: 'black', toColor: 'red' };
        w.color = 'red';
        x = xParent;
        xParent = x.parent ?? null;
      } else if (w) {
        if (!w.left || w.left.color === 'black') {
          // Case 3
          if (w.right) {
            yield { type: 'delete-fixup', nodeId: w.right.id, case: 3 };
            yield { type: 'recolor', nodeId: w.right.id, fromColor: 'red', toColor: 'black' };
            w.right.color = 'black';
          }
          yield { type: 'recolor', nodeId: w.id, fromColor: 'black', toColor: 'red' };
          w.color = 'red';
          yield { type: 'rotate-left', pivotId: w.right!.id, parentId: w.id };
          newRoot = rotateLeft(newRoot, w);
          w = xParent.left;
        }
        // Case 4
        if (w) {
          yield { type: 'delete-fixup', nodeId: w.id, case: 4 };
          yield { type: 'recolor', nodeId: w.id, fromColor: w.color, toColor: xParent.color };
          w.color = xParent.color;
          yield { type: 'recolor', nodeId: xParent.id, fromColor: xParent.color, toColor: 'black' };
          xParent.color = 'black';
          if (w.left) {
            yield { type: 'recolor', nodeId: w.left.id, fromColor: 'red', toColor: 'black' };
            w.left.color = 'black';
          }
          yield { type: 'rotate-right', pivotId: w.id, parentId: xParent.id };
          newRoot = rotateRight(newRoot, xParent);
        }
        x = newRoot;
        break;
      }
    }
  }

  if (x) {
    x.color = 'black';
  }

  return newRoot;
}

export function* rbDelete(
  root: RBTreeNode | null,
  value: number
): Generator<RBTreeStep> {
  if (!root) {
    yield { type: 'done', tree: null, operation: 'delete', stats: { found: false } };
    return;
  }

  // Find node to delete
  let z: RBTreeNode | null = root;
  while (z && z.value !== value) {
    const direction = value < z.value ? 'left' : 'right';
    yield { type: 'compare', nodeId: z.id, value: z.value, searchValue: value, direction };
    z = value < z.value ? z.left : z.right;
  }

  if (!z) {
    yield { type: 'search', nodeId: '', found: false };
    yield { type: 'done', tree: root, operation: 'delete', stats: { found: false } };
    return;
  }

  yield { type: 'compare', nodeId: z.id, value: z.value, searchValue: value, direction: 'found' };
  yield { type: 'delete', nodeId: z.id, value: z.value };

  let y = z;
  let yOriginalColor = y.color;
  let x: RBTreeNode | null;
  let xParent: RBTreeNode | null;
  let newRoot = root;

  if (!z.left) {
    x = z.right;
    xParent = z.parent ?? null;
    yield { type: 'transplant', removedId: z.id, replacementId: x?.id || null };
    newRoot = transplant(newRoot, z, z.right);
  } else if (!z.right) {
    x = z.left;
    xParent = z.parent ?? null;
    yield { type: 'transplant', removedId: z.id, replacementId: x?.id || null };
    newRoot = transplant(newRoot, z, z.left);
  } else {
    y = findMinimum(z.right);
    yOriginalColor = y.color;
    x = y.right;

    if (y.parent === z) {
      xParent = y;
    } else {
      xParent = y.parent ?? null;
      yield { type: 'transplant', removedId: y.id, replacementId: y.right?.id || null };
      newRoot = transplant(newRoot, y, y.right);
      y.right = z.right;
      y.right.parent = y;
    }

    yield { type: 'transplant', removedId: z.id, replacementId: y.id };
    newRoot = transplant(newRoot, z, y);
    y.left = z.left;
    y.left.parent = y;
    y.color = z.color;
  }

  if (yOriginalColor === 'black') {
    const fixupGen = deleteFixup(newRoot, x, xParent);
    let result = fixupGen.next();
    while (!result.done) {
      yield result.value;
      result = fixupGen.next();
    }
    newRoot = result.value;
  }

  yield { type: 'done', tree: newRoot, operation: 'delete', stats: { found: true, size: countNodes(newRoot), height: getTreeHeight(newRoot) } };
}

// ==================== TRAVERSALS ====================

export function inOrderTraversal(node: RBTreeNode | null): number[] {
  if (!node) return [];
  return [...inOrderTraversal(node.left), node.value, ...inOrderTraversal(node.right)];
}

export function preOrderTraversal(node: RBTreeNode | null): number[] {
  if (!node) return [];
  return [node.value, ...preOrderTraversal(node.left), ...preOrderTraversal(node.right)];
}

// ==================== VALIDATION ====================

export function validateRBTree(node: RBTreeNode | null): { valid: boolean; error?: string } {
  if (!node) return { valid: true };

  // Rule 1: Root must be black
  if (node.color !== 'black') {
    return { valid: false, error: 'Root must be black' };
  }

  function checkBlackHeight(n: RBTreeNode | null): number {
    if (!n) return 1;

    const leftHeight = checkBlackHeight(n.left);
    const rightHeight = checkBlackHeight(n.right);

    if (leftHeight === -1 || rightHeight === -1 || leftHeight !== rightHeight) {
      return -1;
    }

    return leftHeight + (n.color === 'black' ? 1 : 0);
  }

  function checkRedProperty(n: RBTreeNode | null): boolean {
    if (!n) return true;

    // Rule 3: Red nodes must have black children
    if (n.color === 'red') {
      if ((n.left && n.left.color === 'red') || (n.right && n.right.color === 'red')) {
        return false;
      }
    }

    return checkRedProperty(n.left) && checkRedProperty(n.right);
  }

  if (!checkRedProperty(node)) {
    return { valid: false, error: 'Red node has red child' };
  }

  if (checkBlackHeight(node) === -1) {
    return { valid: false, error: 'Black heights are unequal' };
  }

  return { valid: true };
}

// ==================== LAYOUT CALCULATION ====================

export function calculateRBTreeLayout(
  root: RBTreeNode | null,
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  if (!root) return positions;

  const treeHeight = getTreeHeight(root);
  const levelHeight = height / (treeHeight + 1);

  function calculatePosition(
    node: RBTreeNode | null,
    depth: number,
    left: number,
    right: number
  ): void {
    if (!node) return;

    const x = (left + right) / 2;
    const y = depth * levelHeight + levelHeight / 2;

    positions.set(node.id, { x, y });

    const mid = (left + right) / 2;
    calculatePosition(node.left, depth + 1, left, mid);
    calculatePosition(node.right, depth + 1, mid, right);
  }

  calculatePosition(root, 0, 0, width);

  return positions;
}
