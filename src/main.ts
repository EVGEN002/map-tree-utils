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
  parentKey: string = "parentId" as ParentKey
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

      const flatNode: Omit<T, ChildKey> & { [K in ParentKey]?: string | null } = {
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
