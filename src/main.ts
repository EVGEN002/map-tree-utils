export type TreeNode<T, ChildKey extends string> = T & {
  [K in ChildKey]: TreeNode<T, ChildKey>[];
};

export const getTree = <
  T extends Record<string, any>,
  ParentKey extends keyof T & string = "parentId",
  ChildKey extends string = "children"
>(
  map: Map<string, T>,
  childKey: ChildKey = "children" as ChildKey,
  parentKey: string = "parentId" as ParentKey,
  sortBy?:
    | keyof T
    | string
    | ((a: TreeNode<T, ChildKey>, b: TreeNode<T, ChildKey>) => number),
  order: "asc" | "desc" = "asc"
) => {
  const copy = new Map<string, TreeNode<T, ChildKey>>();

  for (const [id, node] of map.entries()) {
    copy.set(id, { ...node, [childKey]: [] } as TreeNode<T, ChildKey>);
  }

  const roots: TreeNode<T, ChildKey>[] = [];

  for (const node of copy.values()) {
    const parentId = node[parentKey];

    if (parentId && typeof parentId === "string") {
      const parent = copy.get(parentId);
      if (parent) {
        (parent[childKey] as TreeNode<T, ChildKey>[]).push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  let comparator: (
    a: TreeNode<T, ChildKey>,
    b: TreeNode<T, ChildKey>
  ) => number;

  if (typeof sortBy === "function") {
    comparator = sortBy;
  } else if (sortBy != null) {
    const key = sortBy as keyof T | string;
    comparator = (a, b) => {
      const va = (a as any)[key];
      const vb = (b as any)[key];

      if (va == null && vb == null) return 0;
      if (va == null) return -1;
      if (vb == null) return 1;

      if (typeof va === "number" && typeof vb === "number") return va - vb;

      return String(va).localeCompare(String(vb));
    };
  } else {
    comparator = () => 0;
  }

  const dir = order === "asc" ? 1 : -1;

  const sortRecursively = (nodes: TreeNode<T, ChildKey>[]) => {
    if (!nodes || nodes.length === 0) return;
    if (sortBy != null) {
      nodes.sort((a, b) => comparator(a, b) * dir);
    }
    for (const n of nodes) {
      sortRecursively(n[childKey] as TreeNode<T, ChildKey>[]);
    }
  };

  sortRecursively(roots);

  return roots;
};

export const getMap = <
  T extends Record<string, any>,
  IdKey extends keyof T & string = "id",
  ParentKey extends string = "parentId",
  ChildKey extends string = "children"
>(
  tree: T[],
  childKey: ChildKey = "children" as ChildKey,
  parentKey: ParentKey = "parentId" as ParentKey,
  idKey: IdKey = "id" as IdKey
): Map<string, Omit<T, ChildKey> & { [K in ParentKey]?: string | null }> => {
  const normalized: Map<
    string,
    Omit<T, ChildKey> & { [K in ParentKey]?: string | null }
  > = new Map();

  const walkTree = (nodes: T[], parentId?: string): void => {
    for (const node of nodes) {
      const children = node[childKey] as unknown as T[] | undefined;

      const flatNode: Omit<T, ChildKey> & { [K in ParentKey]?: string | null } =
        {
          ...node,
          ...(parentId ? { [parentKey]: parentId } : {}),
        };
      delete (flatNode as any)[childKey];

      normalized.set(String(node[idKey]), flatNode);

      if (Array.isArray(children) && children.length > 0) {
        walkTree(children, String(node[idKey]));
      }
    }
  };

  walkTree(tree);

  return normalized;
};
