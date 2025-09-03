![npm version](https://img.shields.io/npm/v/map-tree-utils)

# map-tree-utils
> Tiny TypeScript utilities to convert between flat Map<string, T> structures and nested tree arrays.

## Install

```bash
# npm
npm install map-tree-utils

# yarn
yarn add map-tree-utils

# pnpm
pnpm add map-tree-utils

# bun
bun i map-tree-utils
```

## Why

When working with hierarchical data, you often face two common tasks:

1. You receive a nested tree (e.g., from an API or authored JSON) and want to normalize it into a flat Map for fast lookups and updates.

2. You have a flat structure (e.g., a `Map` keyed by `id`) and need to render it as a nested tree for UI or export.

`map-tree-utils` provides two small, focused helpers with zero runtime dependencies to handle this:

- `getTree` — convert a `Map<string, T>` (flat) into a nested array of root nodes (tree).

- `getMap` — convert a nested array (tree) into a `Map<string, AnyObj>` (flat).

Written in TypeScript, both functions are simple, predictable, and easy to drop into any frontend or backend project. They save you from writing repetitive boilerplate code while keeping your data handling fast and type-safe.

## Quick example

```ts
import { getTree, getMap } from "map-tree-utils";

// --- Example: flat Map representing hierarchical data ---
const map = new Map([
  ["1", { id: "1", name: "Root" }],
  ["2", { id: "2", name: "Child A", parentId: "1" }],
  ["3", { id: "3", name: "Child B", parentId: "1" }],
  ["4", { id: "4", name: "Grandchild", parentId: "2" }],
]);

// Convert flat Map → nested tree
const tree = getTree(map);
console.log("Nested tree:");
console.log(JSON.stringify(tree, null, 2));

// Convert back: nested tree → flat Map
const flatMap = getMap(tree);
console.log("Flattened Map, item with id '4':");
console.log(flatMap.get("4")); 
// Output: { id: "4", name: "Grandchild", parentId: "2" }
```

## API
```ts
getTree<T>(map: Map<string, T>, childKey = "children", parentKey = "parentId"): Array<T & AnyObj>
```
Converts a `Map` of nodes into a nested array of root nodes.

**Parameters**

- `map: Map<string, T>` - a Map where each value is a node object containing an identifier and optionally a parent reference.

- `childKey: string` - the key to use for children arrays in the output nodes. Default: "children".

- `parentKey: string` - the key used on nodes to identify their parent. Default: "parentId".

**Returns**

An array of nodes that are roots (nodes with no parent found in the provided Map). Each node in the returned tree is a shallow copy of the original node with an added children (or custom childKey) array.

**Notes**

- The function creates shallow copies of nodes so the original Map values are not mutated.

- If a node references a `parentKey: string` that does not exist in the Map, the node will be treated as a root.

#

```ts
getMap(tree: AnyObj[], childKey = "children", parentKey = "parentId", idKey = "id"): Map<string, AnyObj>
```
Flattens a nested tree array into a `Map<string, AnyObj>` keyed by id (or a custom idKey).

**Parameters**

- `tree: AnyObj[]` - array of tree nodes (roots).

- `childKey: string` - property name that holds child nodes. Default: "children".

- `parentKey: string` - property name to be assigned to flattened nodes to indicate their parent id. Default: "parentId".

- `idKey: string` - property name used in the original nodes to identify them. Default: "id".

**Returns**

A `Map<string, AnyObj>` where each key is the stringified id and each value is a shallow copy of the node (the children property is removed). Each child node will have a parentId pointing to its parent in the flattened structure.

**Notes**

The function will coerce the id value to String() when using it as a Map key.

children arrays are omitted in the flattened node objects.

## Performance

Both utilities walk every node exactly once and perform O(N) operations (plus Map lookups which are O(1) amortized). They are suitable for reasonably sized trees used in frontend apps or typical backend data normalization tasks.

**License: MIT**
