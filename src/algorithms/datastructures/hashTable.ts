import { HashTableStep, HashEntry, CollisionStrategy } from "../../types/dataStructures";

// Simple hash function for strings
function hash(key: string, size: number): number {
  let hashValue = 0;
  for (let i = 0; i < key.length; i++) {
    hashValue = (hashValue * 31 + key.charCodeAt(i)) % size;
  }
  return Math.abs(hashValue);
}

// Secondary hash for double hashing
function hash2(key: string, size: number): number {
  let hashValue = 0;
  for (let i = 0; i < key.length; i++) {
    hashValue = (hashValue * 17 + key.charCodeAt(i)) % size;
  }
  // Ensure it's odd and non-zero for better distribution
  return Math.abs(hashValue) | 1;
}

// Create an empty hash table
export function createHashTable(size: number = 11): HashEntry[] {
  return Array(size).fill(null).map(() => ({
    key: '',
    value: '',
    status: 'empty' as const
  }));
}

// Insert with separate chaining
export function* hashInsertChaining(
  table: HashEntry[],
  key: string,
  value: string
): Generator<HashTableStep> {
  const newTable = table.map(entry => ({ ...entry }));
  const index = hash(key, newTable.length);
  const hashValue = hash(key, newTable.length);

  yield { type: 'hash', key, index, hash: hashValue };

  // Check if slot is empty
  if (!newTable[index].key || newTable[index].status === 'empty') {
    newTable[index] = { key, value, status: 'occupied', next: null };
    yield { type: 'insert', key, value, index };
  } else {
    // Collision - add to chain
    yield { type: 'collision', key, index, strategy: 'chaining' };

    let current = newTable[index];
    // Check if key already exists in chain
    while (current) {
      if (current.key === key) {
        current.value = value; // Update existing
        yield { type: 'insert', key, value, index };
        yield { type: 'done', table: newTable, operation: 'insert', stats: { collisions: 1 } };
        return;
      }
      if (!current.next) break;
      current = current.next;
    }

    // Add to end of chain
    current.next = { key, value, status: 'occupied' };
    yield { type: 'insert', key, value, index };
  }

  yield { type: 'done', table: newTable, operation: 'insert' };
}

// Insert with linear probing
export function* hashInsertLinear(
  table: HashEntry[],
  key: string,
  value: string
): Generator<HashTableStep> {
  const newTable = table.map(entry => ({ ...entry }));
  const size = newTable.length;
  const initialIndex = hash(key, size);

  yield { type: 'hash', key, index: initialIndex, hash: initialIndex };

  const probeIndexes: number[] = [initialIndex];
  let index = initialIndex;
  let probeCount = 0;

  while (probeCount < size) {
    if (!newTable[index].key || newTable[index].status === 'empty' || newTable[index].status === 'deleted') {
      // Found empty slot
      newTable[index] = { key, value, status: 'occupied', probeCount };
      yield { type: 'probe', key, indexes: probeIndexes, probeType: 'linear' };
      yield { type: 'insert', key, value, index };
      yield { type: 'done', table: newTable, operation: 'insert', stats: { probes: probeCount } };
      return;
    }

    if (newTable[index].key === key) {
      // Key already exists, update value
      newTable[index].value = value;
      yield { type: 'probe', key, indexes: probeIndexes, probeType: 'linear' };
      yield { type: 'insert', key, value, index };
      yield { type: 'done', table: newTable, operation: 'insert', stats: { probes: probeCount } };
      return;
    }

    // Collision
    if (probeCount === 0) {
      yield { type: 'collision', key, index, strategy: 'linear-probing' };
    }

    probeCount++;
    index = (initialIndex + probeCount) % size;
    probeIndexes.push(index);
  }

  // Table is full
  yield { type: 'done', table: newTable, operation: 'insert', stats: { error: 'Table full' } };
}

// Insert with quadratic probing
export function* hashInsertQuadratic(
  table: HashEntry[],
  key: string,
  value: string
): Generator<HashTableStep> {
  const newTable = table.map(entry => ({ ...entry }));
  const size = newTable.length;
  const initialIndex = hash(key, size);

  yield { type: 'hash', key, index: initialIndex, hash: initialIndex };

  const probeIndexes: number[] = [initialIndex];
  let probeCount = 0;

  while (probeCount < size) {
    const index = (initialIndex + probeCount * probeCount) % size;

    if (!newTable[index].key || newTable[index].status === 'empty' || newTable[index].status === 'deleted') {
      newTable[index] = { key, value, status: 'occupied', probeCount };
      yield { type: 'probe', key, indexes: probeIndexes, probeType: 'quadratic' };
      yield { type: 'insert', key, value, index };
      yield { type: 'done', table: newTable, operation: 'insert', stats: { probes: probeCount } };
      return;
    }

    if (newTable[index].key === key) {
      newTable[index].value = value;
      yield { type: 'probe', key, indexes: probeIndexes, probeType: 'quadratic' };
      yield { type: 'insert', key, value, index };
      yield { type: 'done', table: newTable, operation: 'insert', stats: { probes: probeCount } };
      return;
    }

    if (probeCount === 0) {
      yield { type: 'collision', key, index, strategy: 'quadratic-probing' };
    }

    probeCount++;
    const nextIndex = (initialIndex + probeCount * probeCount) % size;
    probeIndexes.push(nextIndex);
  }

  yield { type: 'done', table: newTable, operation: 'insert', stats: { error: 'Table full' } };
}

// Search in hash table
export function* hashSearch(
  table: HashEntry[],
  key: string,
  strategy: CollisionStrategy = 'linear-probing'
): Generator<HashTableStep> {
  const size = table.length;
  const initialIndex = hash(key, size);

  yield { type: 'hash', key, index: initialIndex, hash: initialIndex };

  if (strategy === 'chaining') {
    let current: HashEntry | null | undefined = table[initialIndex];
    while (current && current.key) {
      if (current.key === key) {
        yield { type: 'search', key, found: true, index: initialIndex };
        yield { type: 'done', table, operation: 'search', stats: { found: true } };
        return;
      }
      current = current.next;
    }
    yield { type: 'search', key, found: false };
    yield { type: 'done', table, operation: 'search', stats: { found: false } };
    return;
  }

  // Linear or quadratic probing
  const probeIndexes: number[] = [];
  let probeCount = 0;

  while (probeCount < size) {
    let index: number;
    if (strategy === 'quadratic-probing') {
      index = (initialIndex + probeCount * probeCount) % size;
    } else {
      index = (initialIndex + probeCount) % size;
    }

    probeIndexes.push(index);

    if (!table[index].key || table[index].status === 'empty') {
      yield { type: 'probe', key, indexes: probeIndexes, probeType: strategy === 'quadratic-probing' ? 'quadratic' : 'linear' };
      yield { type: 'search', key, found: false };
      yield { type: 'done', table, operation: 'search', stats: { found: false, probes: probeCount } };
      return;
    }

    if (table[index].key === key && table[index].status === 'occupied') {
      yield { type: 'probe', key, indexes: probeIndexes, probeType: strategy === 'quadratic-probing' ? 'quadratic' : 'linear' };
      yield { type: 'search', key, found: true, index };
      yield { type: 'done', table, operation: 'search', stats: { found: true, probes: probeCount } };
      return;
    }

    probeCount++;
  }

  yield { type: 'search', key, found: false };
  yield { type: 'done', table, operation: 'search', stats: { found: false, probes: probeCount } };
}

// Delete from hash table
export function* hashDelete(
  table: HashEntry[],
  key: string,
  strategy: CollisionStrategy = 'linear-probing'
): Generator<HashTableStep> {
  const newTable = table.map(entry => ({ ...entry }));
  const size = newTable.length;
  const initialIndex = hash(key, size);

  yield { type: 'hash', key, index: initialIndex, hash: initialIndex };

  if (strategy === 'chaining') {
    let current = newTable[initialIndex];
    let prev: HashEntry | null = null;

    while (current && current.key) {
      if (current.key === key) {
        if (prev) {
          prev.next = current.next;
        } else {
          newTable[initialIndex] = current.next || { key: '', value: '', status: 'empty' };
        }
        yield { type: 'delete', key, index: initialIndex };
        yield { type: 'done', table: newTable, operation: 'delete' };
        return;
      }
      prev = current;
      current = current.next!;
    }

    yield { type: 'done', table: newTable, operation: 'delete', stats: { found: false } };
    return;
  }

  // Linear or quadratic probing - use lazy deletion
  let probeCount = 0;

  while (probeCount < size) {
    let index: number;
    if (strategy === 'quadratic-probing') {
      index = (initialIndex + probeCount * probeCount) % size;
    } else {
      index = (initialIndex + probeCount) % size;
    }

    if (!newTable[index].key || newTable[index].status === 'empty') {
      yield { type: 'done', table: newTable, operation: 'delete', stats: { found: false } };
      return;
    }

    if (newTable[index].key === key && newTable[index].status === 'occupied') {
      newTable[index].status = 'deleted';
      yield { type: 'delete', key, index };
      yield { type: 'done', table: newTable, operation: 'delete' };
      return;
    }

    probeCount++;
  }

  yield { type: 'done', table: newTable, operation: 'delete', stats: { found: false } };
}

// Calculate load factor
export function getLoadFactor(table: HashEntry[]): number {
  const occupied = table.filter(e => e.status === 'occupied').length;
  return occupied / table.length;
}

// Count collisions in table
export function countCollisions(table: HashEntry[]): number {
  let collisions = 0;
  for (const entry of table) {
    if (entry.probeCount && entry.probeCount > 0) {
      collisions++;
    }
    if (entry.next) {
      let current = entry.next;
      while (current) {
        collisions++;
        current = current.next!;
      }
    }
  }
  return collisions;
}
