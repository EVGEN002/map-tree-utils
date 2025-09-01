export type AnyObj = Record<string, any>;

export const getTree = <T>(
  map: Map<string, T>,
  childKey: string = "children",
  parentKey: string = "parentId"
) => {
  const copy = new Map<string, T & AnyObj>();

  for (const [id, node] of map.entries()) {
    copy.set(id, { ...(node as AnyObj), [childKey]: [] } as T & AnyObj);
  }

  const roots: Array<T & AnyObj> = [];

  for (const node of copy.values()) {
    const parentId = node[parentKey];

    if (parentId && typeof parentId === "string") {
      const parent = copy.get(parentId);
      if (parent) {
        (parent[childKey] as Array<T & AnyObj>).push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
};

export const getMap = (
  tree: AnyObj[],
  childKey: string = "children",
  parentKey: string = "parentId",
  idKey: string = "id"
): Map<string, AnyObj> => {
  const normalized: Map<string, AnyObj> = new Map();

  const walkTree = (nodes: AnyObj[], parentId?: string) => {
    for (const node of nodes) {
      const children = node[childKey] as AnyObj[] | undefined;

      const { [childKey]: _, ...rest } = node;
      const flatNode: AnyObj = { ...rest };

      if (parentId) flatNode[parentKey] = parentId;

      const id = String(node[idKey]);
      normalized.set(id, flatNode);

      if (Array.isArray(children) && children.length > 0) {
        walkTree(children, id);
      }
    }
  };

  walkTree(tree);

  return normalized;
};
