import { TreeNode, AVLStep } from "../../types/dataStructures";

// Helper function to create a new node
function createNode(value: number): TreeNode {
  return {
    id: Math.random().toString(36).substr(2, 9),
    value,
    left: null,
    right: null,
    height: 1,
    balance: 0
  };
}

// Get height of a node
function getHeight(node: TreeNode | null): number {
  return node?.height ?? 0;
}

// Get balance factor of a node
function getBalance(node: TreeNode | null): number {
  if (!node) return 0;
  return getHeight(node.left) - getHeight(node.right);
}

// Update height of a node
function updateHeight(node: TreeNode): void {
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
  node.balance = getBalance(node);
}

// Right rotation
function rotateRight(y: TreeNode): TreeNode {
  const x = y.left!;
  const T2 = x.right;

  // Perform rotation
  x.right = y;
  y.left = T2;

  // Update heights
  updateHeight(y);
  updateHeight(x);

  return x;
}

// Left rotation
function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  const T2 = y.left;

  // Perform rotation
  y.left = x;
  x.right = T2;

  // Update heights
  updateHeight(x);
  updateHeight(y);

  return y;
}

// Deep clone a tree node
function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    ...node,
    left: cloneTree(node.left),
    right: cloneTree(node.right)
  };
}

// Insert a value into AVL tree with step tracking
export function* avlInsert(root: TreeNode | null, value: number): Generator<AVLStep> {
  const path: number[] = [];

  function* insertNode(node: TreeNode | null): Generator<AVLStep, TreeNode, unknown> {
    if (!node) {
      const newNode = createNode(value);
      yield { type: 'insert', node: newNode, parent: null, path: [...path] };
      return newNode;
    }

    yield { type: 'compare', node, value, path: [...path] };

    if (value < node.value) {
      path.push(node.value);
      node.left = yield* insertNode(node.left);
    } else if (value > node.value) {
      path.push(node.value);
      node.right = yield* insertNode(node.right);
    } else {
      // Duplicate value
      return node;
    }

    // Update height
    const oldHeight = node.height ?? 1;
    updateHeight(node);

    if (oldHeight !== node.height) {
      yield { type: 'update-height', node, oldHeight, newHeight: node.height! };
    }

    // Check balance
    const balance = getBalance(node);
    yield { type: 'balance-check', node, balance, needsRotation: Math.abs(balance) > 1 };

    // Left Left Case
    if (balance > 1 && value < node.left!.value) {
      yield { type: 'rotate-right', node, pivot: node.left! };
      return rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && value > node.right!.value) {
      yield { type: 'rotate-left', node, pivot: node.right! };
      return rotateLeft(node);
    }

    // Left Right Case
    if (balance > 1 && value > node.left!.value) {
      yield { type: 'rotate-left-right', node };
      node.left = rotateLeft(node.left!);
      return rotateRight(node);
    }

    // Right Left Case
    if (balance < -1 && value < node.right!.value) {
      yield { type: 'rotate-right-left', node };
      node.right = rotateRight(node.right!);
      return rotateLeft(node);
    }

    return node;
  }

  // Clone the tree to avoid mutation issues
  const treeCopy = cloneTree(root);
  const newRoot = yield* insertNode(treeCopy);

  yield { type: 'done', tree: newRoot, operation: 'insert', result: value };
}

// Find minimum value node
function findMin(node: TreeNode): TreeNode {
  let current = node;
  while (current.left) {
    current = current.left;
  }
  return current;
}

// Delete a value from AVL tree with step tracking
export function* avlDelete(root: TreeNode | null, value: number): Generator<AVLStep> {
  const path: number[] = [];

  function* deleteNode(node: TreeNode | null): Generator<AVLStep, TreeNode | null, unknown> {
    if (!node) {
      yield { type: 'done', tree: root, operation: 'delete', result: null };
      return null;
    }

    yield { type: 'compare', node, value, path: [...path] };

    if (value < node.value) {
      path.push(node.value);
      node.left = yield* deleteNode(node.left);
    } else if (value > node.value) {
      path.push(node.value);
      node.right = yield* deleteNode(node.right);
    } else {
      // Node to delete found
      yield { type: 'delete', node, parent: null, path: [...path] };

      // Node with one child or no child
      if (!node.left || !node.right) {
        const temp = node.left ?? node.right;
        return temp;
      }

      // Node with two children
      const successor = findMin(node.right);
      yield { type: 'highlight', node: successor, reason: 'In-order successor' };

      node.value = successor.value;
      node.id = successor.id;
      node.right = yield* deleteNode(node.right);
    }

    if (!node) return null;

    // Update height
    const oldHeight = node.height ?? 1;
    updateHeight(node);

    if (oldHeight !== node.height) {
      yield { type: 'update-height', node, oldHeight, newHeight: node.height! };
    }

    // Check balance
    const balance = getBalance(node);
    yield { type: 'balance-check', node, balance, needsRotation: Math.abs(balance) > 1 };

    // Left Left Case
    if (balance > 1 && getBalance(node.left) >= 0) {
      yield { type: 'rotate-right', node, pivot: node.left! };
      return rotateRight(node);
    }

    // Left Right Case
    if (balance > 1 && getBalance(node.left) < 0) {
      yield { type: 'rotate-left-right', node };
      node.left = rotateLeft(node.left!);
      return rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && getBalance(node.right) <= 0) {
      yield { type: 'rotate-left', node, pivot: node.right! };
      return rotateLeft(node);
    }

    // Right Left Case
    if (balance < -1 && getBalance(node.right) > 0) {
      yield { type: 'rotate-right-left', node };
      node.right = rotateRight(node.right!);
      return rotateLeft(node);
    }

    return node;
  }

  const treeCopy = cloneTree(root);
  const newRoot = yield* deleteNode(treeCopy);

  yield { type: 'done', tree: newRoot, operation: 'delete', result: value };
}

// Search for a value in AVL tree
export function* avlSearch(root: TreeNode | null, value: number): Generator<AVLStep> {
  const path: number[] = [];
  let current = root;

  while (current) {
    yield { type: 'compare', node: current, value, path: [...path] };

    if (value === current.value) {
      yield { type: 'search', node: current, found: true, path: [...path] };
      yield { type: 'done', tree: root, operation: 'search', result: current };
      return;
    }

    path.push(current.value);
    if (value < current.value) {
      current = current.left;
    } else {
      current = current.right;
    }
  }

  yield { type: 'search', node: createNode(value), found: false, path: [...path] };
  yield { type: 'done', tree: root, operation: 'search', result: null };
}

// Build AVL tree from array
export function* buildAVL(values: number[]): Generator<AVLStep> {
  let root: TreeNode | null = null;

  for (const value of values) {
    // Use synchronous insert for building
    root = insertSync(root, value);

    yield { type: 'insert', node: findNode(root, value)!, parent: null, path: [] };
  }

  yield { type: 'done', tree: root, operation: 'build', result: { size: values.length } };
}

// Synchronous insert for building
function insertSync(node: TreeNode | null, value: number): TreeNode {
  if (!node) {
    return createNode(value);
  }

  if (value < node.value) {
    node.left = insertSync(node.left, value);
  } else if (value > node.value) {
    node.right = insertSync(node.right, value);
  } else {
    return node;
  }

  updateHeight(node);

  const balance = getBalance(node);

  // Left Left
  if (balance > 1 && value < node.left!.value) {
    return rotateRight(node);
  }

  // Right Right
  if (balance < -1 && value > node.right!.value) {
    return rotateLeft(node);
  }

  // Left Right
  if (balance > 1 && value > node.left!.value) {
    node.left = rotateLeft(node.left!);
    return rotateRight(node);
  }

  // Right Left
  if (balance < -1 && value < node.right!.value) {
    node.right = rotateRight(node.right!);
    return rotateLeft(node);
  }

  return node;
}

// Find a node by value
function findNode(root: TreeNode | null, value: number): TreeNode | null {
  if (!root) return null;
  if (root.value === value) return root;
  if (value < root.value) return findNode(root.left, value);
  return findNode(root.right, value);
}

// Validate AVL property
export function* avlValidate(root: TreeNode | null): Generator<AVLStep> {
  function* validate(node: TreeNode | null): Generator<AVLStep, boolean, unknown> {
    if (!node) return true;

    const balance = getBalance(node);
    yield { type: 'balance-check', node, balance, needsRotation: Math.abs(balance) > 1 };

    if (Math.abs(balance) > 1) {
      yield { type: 'highlight', node, reason: 'AVL violation: balance = ' + balance };
      return false;
    }

    const leftValid = yield* validate(node.left);
    const rightValid = yield* validate(node.right);

    return leftValid && rightValid;
  }

  const isValid = yield* validate(root);
  yield { type: 'done', tree: root, operation: 'validate', result: { isValid } };
}

// Get tree statistics
export function getAVLStats(root: TreeNode | null): { size: number; height: number; isBalanced: boolean } {
  function countNodes(node: TreeNode | null): number {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  }

  function checkBalanced(node: TreeNode | null): boolean {
    if (!node) return true;
    const balance = Math.abs(getBalance(node));
    return balance <= 1 && checkBalanced(node.left) && checkBalanced(node.right);
  }

  return {
    size: countNodes(root),
    height: getHeight(root),
    isBalanced: checkBalanced(root)
  };
}
