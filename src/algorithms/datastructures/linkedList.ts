import { LinkedListNode, LinkedListStep } from '../../types/dataStructures';

// ==================== HELPER FUNCTIONS ====================

let nodeIdCounter = 0;

export function resetNodeIdCounter(): void {
  nodeIdCounter = 0;
}

export function createNode(value: number): LinkedListNode {
  return { id: `ll-${nodeIdCounter++}`, value, next: null };
}

export function createDoublyNode(value: number): LinkedListNode {
  return { id: `dll-${nodeIdCounter++}`, value, next: null, prev: null };
}

export function listToArray(head: LinkedListNode | null): LinkedListNode[] {
  const result: LinkedListNode[] = [];
  let current = head;
  while (current) {
    result.push(current);
    current = current.next;
  }
  return result;
}

export function cloneList(head: LinkedListNode | null, doubly = false): LinkedListNode | null {
  if (!head) return null;

  const nodeMap = new Map<string, LinkedListNode>();
  let current: LinkedListNode | null = head;

  // First pass: create all nodes
  while (current) {
    const cloned = doubly ? createDoublyNode(current.value) : createNode(current.value);
    cloned.id = current.id; // Preserve original IDs for animation
    nodeMap.set(current.id, cloned);
    current = current.next;
  }

  // Second pass: link nodes
  current = head;
  while (current) {
    const cloned = nodeMap.get(current.id)!;
    if (current.next) {
      cloned.next = nodeMap.get(current.next.id)!;
    }
    if (doubly && current.prev) {
      cloned.prev = nodeMap.get(current.prev.id)!;
    }
    current = current.next;
  }

  return nodeMap.get(head.id)!;
}

// ==================== SINGLY LINKED LIST OPERATIONS ====================

export function* insertAtHead(
  head: LinkedListNode | null,
  value: number
): Generator<LinkedListStep> {
  const newNode = createNode(value);

  yield { type: 'insert-head', node: { ...newNode, next: null } };

  newNode.next = head;

  yield { type: 'update-pointers', fromId: newNode.id, toId: head?.id || null, pointerType: 'next' };
  yield { type: 'done', list: newNode, operation: 'insert-head' };
}

export function* insertAtTail(
  head: LinkedListNode | null,
  value: number
): Generator<LinkedListStep> {
  const newNode = createNode(value);

  if (!head) {
    yield { type: 'insert-tail', node: { ...newNode, next: null } };
    yield { type: 'done', list: newNode, operation: 'insert-tail' };
    return;
  }

  let current = head;
  let index = 0;

  while (current.next) {
    yield { type: 'traverse', nodeId: current.id, index };
    current = current.next;
    index++;
  }

  yield { type: 'traverse', nodeId: current.id, index };
  yield { type: 'insert-tail', node: { ...newNode, next: null } };

  current.next = newNode;

  yield { type: 'update-pointers', fromId: current.id, toId: newNode.id, pointerType: 'next' };
  yield { type: 'done', list: head, operation: 'insert-tail' };
}

export function* insertAtIndex(
  head: LinkedListNode | null,
  value: number,
  targetIndex: number
): Generator<LinkedListStep> {
  // Handle head insertion
  if (targetIndex === 0) {
    yield* insertAtHead(head, value);
    return;
  }

  const newNode = createNode(value);
  let current = head;
  let index = 0;

  // Traverse to position before target
  while (current && index < targetIndex - 1) {
    yield { type: 'traverse', nodeId: current.id, index };
    current = current.next;
    index++;
  }

  if (!current) {
    yield { type: 'done', list: head, operation: 'insert-at', stats: { error: 'Index out of bounds' } };
    return;
  }

  yield { type: 'traverse', nodeId: current.id, index };
  yield { type: 'insert-at', node: { ...newNode, next: null }, index: targetIndex };

  newNode.next = current.next;
  current.next = newNode;

  yield { type: 'update-pointers', fromId: newNode.id, toId: newNode.next?.id || null, pointerType: 'next' };
  yield { type: 'update-pointers', fromId: current.id, toId: newNode.id, pointerType: 'next' };
  yield { type: 'done', list: head, operation: 'insert-at' };
}

export function* deleteAtHead(
  head: LinkedListNode | null
): Generator<LinkedListStep> {
  if (!head) {
    yield { type: 'done', list: null, operation: 'delete-head', stats: { error: 'List is empty' } };
    return;
  }

  yield { type: 'delete-head', nodeId: head.id };

  const newHead = head.next;

  yield { type: 'done', list: newHead, operation: 'delete-head' };
}

export function* deleteAtTail(
  head: LinkedListNode | null
): Generator<LinkedListStep> {
  if (!head) {
    yield { type: 'done', list: null, operation: 'delete-tail', stats: { error: 'List is empty' } };
    return;
  }

  if (!head.next) {
    yield { type: 'delete-tail', nodeId: head.id };
    yield { type: 'done', list: null, operation: 'delete-tail' };
    return;
  }

  let current = head;
  let index = 0;

  while (current.next?.next) {
    yield { type: 'traverse', nodeId: current.id, index };
    current = current.next;
    index++;
  }

  yield { type: 'traverse', nodeId: current.id, index };
  yield { type: 'delete-tail', nodeId: current.next!.id };

  current.next = null;

  yield { type: 'update-pointers', fromId: current.id, toId: null, pointerType: 'next' };
  yield { type: 'done', list: head, operation: 'delete-tail' };
}

export function* deleteByValue(
  head: LinkedListNode | null,
  value: number
): Generator<LinkedListStep> {
  if (!head) {
    yield { type: 'done', list: null, operation: 'delete', stats: { found: false } };
    return;
  }

  // Special case: delete head
  if (head.value === value) {
    yield { type: 'compare', nodeId: head.id, value: head.value, searchValue: value };
    yield { type: 'delete-node', nodeId: head.id, index: 0 };
    yield { type: 'done', list: head.next, operation: 'delete', stats: { found: true } };
    return;
  }

  let current = head;
  let index = 0;

  while (current.next) {
    yield { type: 'compare', nodeId: current.id, value: current.value, searchValue: value };

    if (current.next.value === value) {
      yield { type: 'compare', nodeId: current.next.id, value: current.next.value, searchValue: value };
      yield { type: 'delete-node', nodeId: current.next.id, index: index + 1 };

      current.next = current.next.next;

      yield { type: 'update-pointers', fromId: current.id, toId: current.next?.id || null, pointerType: 'next' };
      yield { type: 'done', list: head, operation: 'delete', stats: { found: true, index: index + 1 } };
      return;
    }

    current = current.next;
    index++;
  }

  yield { type: 'compare', nodeId: current.id, value: current.value, searchValue: value };
  yield { type: 'done', list: head, operation: 'delete', stats: { found: false } };
}

export function* searchList(
  head: LinkedListNode | null,
  value: number
): Generator<LinkedListStep> {
  let current = head;
  let index = 0;

  while (current) {
    yield { type: 'compare', nodeId: current.id, value: current.value, searchValue: value };

    if (current.value === value) {
      yield { type: 'search', nodeId: current.id, found: true, index };
      yield { type: 'done', list: head, operation: 'search', stats: { found: true, index } };
      return;
    }

    current = current.next;
    index++;
  }

  yield { type: 'search', nodeId: '', found: false };
  yield { type: 'done', list: head, operation: 'search', stats: { found: false } };
}

export function* reverseList(
  head: LinkedListNode | null
): Generator<LinkedListStep> {
  if (!head || !head.next) {
    yield { type: 'done', list: head, operation: 'reverse' };
    return;
  }

  let prev: LinkedListNode | null = null;
  let current: LinkedListNode | null = head;
  let next: LinkedListNode | null = null;

  while (current) {
    next = current.next;

    yield { type: 'reverse-step', swapNodes: [current.id, prev?.id || 'null'] };

    current.next = prev;

    yield { type: 'update-pointers', fromId: current.id, toId: prev?.id || null, pointerType: 'next' };

    prev = current;
    current = next;
  }

  yield { type: 'done', list: prev, operation: 'reverse' };
}

// ==================== DOUBLY LINKED LIST OPERATIONS ====================

export function* insertAtHeadDoubly(
  head: LinkedListNode | null,
  value: number
): Generator<LinkedListStep> {
  const newNode = createDoublyNode(value);

  yield { type: 'insert-head', node: { ...newNode, next: null, prev: null } };

  newNode.next = head;
  if (head) {
    head.prev = newNode;
    yield { type: 'update-pointers', fromId: head.id, toId: newNode.id, pointerType: 'prev' };
  }

  yield { type: 'update-pointers', fromId: newNode.id, toId: head?.id || null, pointerType: 'next' };
  yield { type: 'done', list: newNode, operation: 'insert-head' };
}

export function* insertAtTailDoubly(
  head: LinkedListNode | null,
  value: number
): Generator<LinkedListStep> {
  const newNode = createDoublyNode(value);

  if (!head) {
    yield { type: 'insert-tail', node: { ...newNode, next: null, prev: null } };
    yield { type: 'done', list: newNode, operation: 'insert-tail' };
    return;
  }

  let current = head;
  let index = 0;

  while (current.next) {
    yield { type: 'traverse', nodeId: current.id, index };
    current = current.next;
    index++;
  }

  yield { type: 'traverse', nodeId: current.id, index };
  yield { type: 'insert-tail', node: { ...newNode, next: null, prev: null } };

  current.next = newNode;
  newNode.prev = current;

  yield { type: 'update-pointers', fromId: current.id, toId: newNode.id, pointerType: 'next' };
  yield { type: 'update-pointers', fromId: newNode.id, toId: current.id, pointerType: 'prev' };
  yield { type: 'done', list: head, operation: 'insert-tail' };
}

export function* insertAtIndexDoubly(
  head: LinkedListNode | null,
  value: number,
  targetIndex: number
): Generator<LinkedListStep> {
  if (targetIndex === 0) {
    yield* insertAtHeadDoubly(head, value);
    return;
  }

  const newNode = createDoublyNode(value);
  let current = head;
  let index = 0;

  while (current && index < targetIndex - 1) {
    yield { type: 'traverse', nodeId: current.id, index };
    current = current.next;
    index++;
  }

  if (!current) {
    yield { type: 'done', list: head, operation: 'insert-at', stats: { error: 'Index out of bounds' } };
    return;
  }

  yield { type: 'traverse', nodeId: current.id, index };
  yield { type: 'insert-at', node: { ...newNode, next: null, prev: null }, index: targetIndex };

  newNode.next = current.next;
  newNode.prev = current;

  if (current.next) {
    current.next.prev = newNode;
    yield { type: 'update-pointers', fromId: current.next.id, toId: newNode.id, pointerType: 'prev' };
  }
  current.next = newNode;

  yield { type: 'update-pointers', fromId: newNode.id, toId: newNode.next?.id || null, pointerType: 'next' };
  yield { type: 'update-pointers', fromId: newNode.id, toId: current.id, pointerType: 'prev' };
  yield { type: 'update-pointers', fromId: current.id, toId: newNode.id, pointerType: 'next' };
  yield { type: 'done', list: head, operation: 'insert-at' };
}

export function* deleteAtHeadDoubly(
  head: LinkedListNode | null
): Generator<LinkedListStep> {
  if (!head) {
    yield { type: 'done', list: null, operation: 'delete-head', stats: { error: 'List is empty' } };
    return;
  }

  yield { type: 'delete-head', nodeId: head.id };

  const newHead = head.next;
  if (newHead) {
    newHead.prev = null;
    yield { type: 'update-pointers', fromId: newHead.id, toId: null, pointerType: 'prev' };
  }

  yield { type: 'done', list: newHead, operation: 'delete-head' };
}

export function* deleteAtTailDoubly(
  head: LinkedListNode | null
): Generator<LinkedListStep> {
  if (!head) {
    yield { type: 'done', list: null, operation: 'delete-tail', stats: { error: 'List is empty' } };
    return;
  }

  if (!head.next) {
    yield { type: 'delete-tail', nodeId: head.id };
    yield { type: 'done', list: null, operation: 'delete-tail' };
    return;
  }

  let current = head;
  let index = 0;

  while (current.next?.next) {
    yield { type: 'traverse', nodeId: current.id, index };
    current = current.next;
    index++;
  }

  yield { type: 'traverse', nodeId: current.id, index };
  yield { type: 'delete-tail', nodeId: current.next!.id };

  current.next = null;

  yield { type: 'update-pointers', fromId: current.id, toId: null, pointerType: 'next' };
  yield { type: 'done', list: head, operation: 'delete-tail' };
}

export function* deleteByValueDoubly(
  head: LinkedListNode | null,
  value: number
): Generator<LinkedListStep> {
  if (!head) {
    yield { type: 'done', list: null, operation: 'delete', stats: { found: false } };
    return;
  }

  // Special case: delete head
  if (head.value === value) {
    yield { type: 'compare', nodeId: head.id, value: head.value, searchValue: value };
    yield { type: 'delete-node', nodeId: head.id, index: 0 };
    const newHead = head.next;
    if (newHead) {
      newHead.prev = null;
      yield { type: 'update-pointers', fromId: newHead.id, toId: null, pointerType: 'prev' };
    }
    yield { type: 'done', list: newHead, operation: 'delete', stats: { found: true } };
    return;
  }

  let current = head;
  let index = 0;

  while (current.next) {
    yield { type: 'compare', nodeId: current.id, value: current.value, searchValue: value };

    if (current.next.value === value) {
      const toDelete = current.next;
      yield { type: 'compare', nodeId: toDelete.id, value: toDelete.value, searchValue: value };
      yield { type: 'delete-node', nodeId: toDelete.id, index: index + 1 };

      current.next = toDelete.next;
      if (toDelete.next) {
        toDelete.next.prev = current;
        yield { type: 'update-pointers', fromId: toDelete.next.id, toId: current.id, pointerType: 'prev' };
      }

      yield { type: 'update-pointers', fromId: current.id, toId: current.next?.id || null, pointerType: 'next' };
      yield { type: 'done', list: head, operation: 'delete', stats: { found: true, index: index + 1 } };
      return;
    }

    current = current.next;
    index++;
  }

  yield { type: 'compare', nodeId: current.id, value: current.value, searchValue: value };
  yield { type: 'done', list: head, operation: 'delete', stats: { found: false } };
}

export function* reverseListDoubly(
  head: LinkedListNode | null
): Generator<LinkedListStep> {
  if (!head || !head.next) {
    yield { type: 'done', list: head, operation: 'reverse' };
    return;
  }

  let current: LinkedListNode | null = head;
  let temp: LinkedListNode | null = null;
  let newHead: LinkedListNode | null = null;

  while (current) {
    yield { type: 'reverse-step', swapNodes: [current.id, current.prev?.id || 'null'] };

    // Swap next and prev
    temp = current.prev ?? null;
    current.prev = current.next;
    current.next = temp;

    yield { type: 'update-pointers', fromId: current.id, toId: current.next?.id || null, pointerType: 'next' };
    yield { type: 'update-pointers', fromId: current.id, toId: current.prev?.id || null, pointerType: 'prev' };

    newHead = current;
    current = current.prev; // Move to next node (which is now prev)
  }

  yield { type: 'done', list: newHead, operation: 'reverse' };
}
