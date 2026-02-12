import { TreeNode, BSTStep } from "../../types/dataStructures";

// Helper function to create a new node
function createNode(value: number): TreeNode {
  return {
    id: Math.random().toString(36).substr(2, 9),
    value,
    left: null,
    right: null
  };
}

// Helper function to calculate tree height
function getHeight(node: TreeNode | null): number {
  if (!node) return -1;
  return 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

// Helper function to find minimum value node in subtree
function findMin(node: TreeNode): TreeNode {
  while (node.left) {
    node = node.left;
  }
  return node;
}

// Insert a value into the BST with step tracking
export function* bstInsert(root: TreeNode | null, value: number): Generator<BSTStep> {
  const originalRoot = root;
  const path: number[] = [];

  // Empty tree case
  if (!root) {
    const newNode = createNode(value);
    yield { type: 'insert', node: newNode, parent: null, path: [] };
    yield { type: 'done', tree: newNode, operation: 'insert', result: value };
    return;
  }

  let current: TreeNode | null = root;
  let parent: TreeNode | null = null;

  // Traverse to find insertion point
  while (current) {
    yield { type: 'compare', node: current, value, path: [...path] };

    if (value === current.value) {
      // Value already exists
      yield { type: 'done', tree: originalRoot, operation: 'insert', result: null };
      return;
    }

    parent = current;
    if (value < current.value) {
      path.push(current.value);
      if (!current.left) {
        // Insert here
        const newNode = createNode(value);
        current.left = newNode;
        yield { type: 'insert', node: newNode, parent: current, path: [...path] };
        yield { type: 'done', tree: originalRoot, operation: 'insert', result: value };
        return;
      }
      current = current.left;
    } else {
      path.push(current.value);
      if (!current.right) {
        // Insert here
        const newNode = createNode(value);
        current.right = newNode;
        yield { type: 'insert', node: newNode, parent: current, path: [...path] };
        yield { type: 'done', tree: originalRoot, operation: 'insert', result: value };
        return;
      }
      current = current.right;
    }
  }
}

// Search for a value in the BST with step tracking
export function* bstSearch(root: TreeNode | null, value: number): Generator<BSTStep> {
  const originalRoot = root;
  const path: number[] = [];

  // Empty tree case
  if (!root) {
    yield { type: 'search', node: createNode(value), found: false, path: [] };
    yield { type: 'done', tree: null, operation: 'search', result: null };
    return;
  }

  let current: TreeNode | null = root;

  // Traverse to find the value
  while (current) {
    yield { type: 'compare', node: current, value, path: [...path] };

    if (value === current.value) {
      // Found!
      yield { type: 'search', node: current, found: true, path: [...path] };
      yield { type: 'done', tree: originalRoot, operation: 'search', result: current };
      return;
    }

    path.push(current.value);
    if (value < current.value) {
      current = current.left;
    } else {
      current = current.right;
    }
  }

  // Not found
  yield { type: 'search', node: createNode(value), found: false, path: [...path] };
  yield { type: 'done', tree: originalRoot, operation: 'search', result: null };
}

// Delete a node from the BST with step tracking
export function* bstDelete(root: TreeNode | null, value: number): Generator<BSTStep> {
  const path: number[] = [];

  // Empty tree case
  if (!root) {
    yield { type: 'delete', node: createNode(value), parent: null, path: [] };
    yield { type: 'done', tree: null, operation: 'delete', result: null };
    return;
  }

  // Find the node to delete and its parent
  let current: TreeNode | null = root;
  let parent: TreeNode | null = null;
  let isLeftChild = false;

  while (current && current.value !== value) {
    yield { type: 'compare', node: current, value, path: [...path] };
    path.push(current.value);
    parent = current;

    if (value < current.value) {
      current = current.left;
      isLeftChild = true;
    } else {
      current = current.right;
      isLeftChild = false;
    }
  }

  // Node not found
  if (!current) {
    yield { type: 'delete', node: createNode(value), parent: null, path: [...path] };
    yield { type: 'done', tree: root, operation: 'delete', result: null };
    return;
  }

  // Found the node to delete
  yield { type: 'compare', node: current, value, path: [...path] };
  yield { type: 'delete', node: current, parent, path: [...path] };

  let newRoot: TreeNode | null = root;

  // Case 1: No children (leaf node)
  if (!current.left && !current.right) {
    if (!parent) {
      // Deleting root with no children
      newRoot = null;
    } else if (isLeftChild) {
      parent.left = null;
    } else {
      parent.right = null;
    }
  }
  // Case 2: One child
  else if (!current.left || !current.right) {
    const child = current.left || current.right;
    if (!parent) {
      // Deleting root with one child
      newRoot = child;
    } else if (isLeftChild) {
      parent.left = child;
    } else {
      parent.right = child;
    }
  }
  // Case 3: Two children
  else {
    // Find in-order successor (minimum in right subtree)
    let successorParent = current;
    let successor = current.right;

    while (successor.left) {
      successorParent = successor;
      successor = successor.left;
    }

    yield { type: 'highlight', node: successor, reason: 'In-order successor' };

    // Copy successor value to current node
    current.value = successor.value;

    // Delete the successor (it has at most one right child)
    if (successorParent === current) {
      successorParent.right = successor.right;
    } else {
      successorParent.left = successor.right;
    }
  }

  yield { type: 'done', tree: newRoot, operation: 'delete', result: value };
}

// Helper function for synchronous BST insertion (used during build)
function insertSync(root: TreeNode | null, value: number): TreeNode {
  if (!root) {
    return createNode(value);
  }
  if (value < root.value) {
    root.left = insertSync(root.left, value);
  } else if (value > root.value) {
    root.right = insertSync(root.right, value);
  }
  return root;
}

// Build a BST from an array of values
export function* buildBST(values: number[]): Generator<BSTStep> {
  let root: TreeNode | null = null;

  for (const value of values) {
    // Yield compare steps as we traverse
    let current = root;
    const path: number[] = [];

    while (current) {
      yield { type: 'compare', node: current, value, path: [...path] };
      path.push(current.value);

      if (value < current.value) {
        if (!current.left) break;
        current = current.left;
      } else if (value > current.value) {
        if (!current.right) break;
        current = current.right;
      } else {
        break; // Duplicate
      }
    }

    // Insert the node
    root = insertSync(root, value);

    // Find the newly inserted node to yield insert step
    let inserted: TreeNode | null = root;
    let parent: TreeNode | null = null;
    while (inserted && inserted.value !== value) {
      parent = inserted;
      inserted = value < inserted.value ? inserted.left : inserted.right;
    }

    if (inserted) {
      yield { type: 'insert', node: inserted, parent, path };
    }
  }

  yield {
    type: 'done',
    tree: root,
    operation: 'build',
    result: { size: values.length, height: getHeight(root) }
  };
}

// Validate BST property
function* validateBST(root: TreeNode | null, min = -Infinity, max = Infinity): Generator<BSTStep, boolean, unknown> {
  if (!root) return true;

  yield { type: 'compare', node: root, value: root.value, path: [min, max] };

  if (root.value < min || root.value > max) {
    yield { type: 'highlight', node: root, reason: 'BST violation' };
    return false;
  }

  const isLeftValid = yield* validateBST(root.left, min, root.value);
  const isRightValid = yield* validateBST(root.right, root.value, max);

  return isLeftValid && isRightValid;
}

export function* bstValidate(root: TreeNode | null): Generator<BSTStep> {
  const isValid = yield* validateBST(root);
  yield {
    type: 'done',
    tree: root,
    operation: 'validate',
    result: { isValid, height: getHeight(root) }
  };
}