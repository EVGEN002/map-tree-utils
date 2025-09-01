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

When you store hierarchical data in a flat structure (for example, in a `Map` keyed by `id`) you often need to render it as a nested tree for UI or export. Conversely, when you receive a nested tree (e.g. from an API or authored JSON) you may want to normalize it into a flat Map for fast lookups and updates.

`map-tree-utils` provides two focused helpers with small surface area and zero runtime dependencies:
- `getTree` - convert a `Map<string, T>` (flat) into a nested array of root nodes (tree)

- `getMap` - convert a nested array (tree) into a `Map<string, AnyObj>` (flat)

Both functions are written in TypeScript and designed to be simple, predictable, and easy to drop into frontend or backend code.

## Quick example

```ts
import { getTree, getMap } from "map-tree-utils";

// Example flat map (each node knows parentId)
const map = new Map([
  ["1", { id: "1", name: "Root" }],
  ["2", { id: "2", name: "Child A", parentId: "1" }],
  ["3", { id: "3", name: "Child B", parentId: "1" }],
  ["4", { id: "4", name: "Grandchild", parentId: "2" }],
]);


const tree = getTree(map);
console.log(JSON.stringify(tree, null, 2));


// Convert back to flat Map
const mapData = getMap(tree);
console.log(mapData.get("4")); // -> { id: "4", name: "Grandchild", parentId: "2" }
```

## API
```ts
getTree<T>(map: Map<string, T>, childKey = "children", parentKey = "parentId"): Array<T & AnyObj>
```
Converts a `Map` of nodes into a nested array of root nodes.

**Parameters**

- `map: Map<string, T>` — a Map where each value is a node object containing an identifier and optionally a parent reference.

- `childKey: string` — the key to use for children arrays in the output nodes. Default: "children".

- `parentKey: string` — the key used on nodes to identify their parent. Default: "parentId".

**Returns**

An array of nodes that are roots (nodes with no parent found in the provided Map). Each node in the returned tree is a shallow copy of the original node with an added children (or custom childKey) array.

**Notes**

- The function creates shallow copies of nodes so the original Map values are not mutated.

- If a node references a `parentId` that does not exist in the Map, the node will be treated as a root.

#

```ts
getMap(tree: AnyObj[], childKey = "children", parentKey = "parentId", idKey = "id"): Map<string, AnyObj>
```
Flattens a nested tree array into a `Map<string, AnyObj>` keyed by id (or a custom idKey).

**Parameters**

- `tree: AnyObj[]` — array of tree nodes (roots).

- `childKey: string` — property name that holds child nodes. Default: "children".

- `parentKey: string` — property name to be assigned to flattened nodes to indicate their parent id. Default: "parentId".

- `idKey: string` — property name used in the original nodes to identify them. Default: "id".

**Returns**

A `Map<string, AnyObj>` where each key is the stringified id and each value is a shallow copy of the node (the children property is removed). Each child node will have a parentId pointing to its parent in the flattened structure.

**Notes**

The function will coerce the id value to String() when using it as a Map key.

children arrays are omitted in the flattened node objects.

## Performance

Both utilities walk every node exactly once and perform O(N) operations (plus Map lookups which are O(1) amortized). They are suitable for reasonably sized trees used in frontend apps or typical backend data normalization tasks.

**License: MIT**
