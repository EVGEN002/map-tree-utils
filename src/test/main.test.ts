import { describe, test, expect, it } from "bun:test";
import { getTree, getMap } from "../main";

describe("map-tree-utils", () => {
  test("converts flat map to tree", () => {
    const map = new Map([
      ["1", { code: "1", name: "Root", parentId: null }],
      ["1_1", { code: "2", name: "Child A", parentId: "1" }],
      ["1_2", { code: "3", name: "Child B", parentId: "1" }],
      ["4", { code: "4", name: "Grandchild", parentId: "1_1" }],
    ]);

    const childKey = "rows";
    const tree = getTree(map, "rows", "parentId");

    expect(tree).toHaveLength(1);
    expect(tree[0][childKey]).toHaveLength(2);
    expect(tree[0][childKey][0][childKey][0].name).toBe("Grandchild");
    expect(tree[0].hasOwnProperty(childKey)).toBe(true);
  });

  test("converts tree to flat map", () => {
    const tree = [
      {
        id: "1",
        name: "Root",
        children: [
          { id: "2", name: "Child A", parentId: "1", children: [] },
          { id: "3", name: "Child B", parentId: "1", children: [] },
        ],
      },
    ];

    const map = getMap(tree, "children", "parentId", "id");

    expect(map.size).toBe(3);
    expect(map.get("2")?.parentId).toBe("1");
    expect(map.get("3")?.name).toBe("Child B");
  });

  test("handles orphan nodes correctly", () => {
    const map = new Map([
      ["1", { id: "1", name: "Root" }],
      ["2", { id: "2", name: "Orphan", parentId: "999" }],
    ]);

    const tree = getTree(map, "children", "parentId");

    expect(tree).toHaveLength(2);
    expect(tree[0].name).toBe("Root");
    expect(tree[1].parentId).toBe("999");
  });

  test("converts flat array to flat map", () => {
    const flatArray: { id: string; name: string; parentId: null | string }[] = [
      { id: "1", name: "Root", parentId: null },
      { id: "1_1", name: "Child A", parentId: "1" },
      { id: "1_2", name: "Child B", parentId: "1" },
      { id: "1_1_1", name: "Grandchild", parentId: "1_1" },
    ];

    const map = getMap(flatArray, "children", "parentId");

    expect(map.get("1")?.parentId).toBe(null);
    expect(map.get("1_1")?.parentId).toBe("1");
    expect(map.get("1_1_1")?.parentId).toBe("1_1");
    expect(map.get("1_1_1")?.name).toBe("Grandchild");
  });

  test("getTree with sorting", () => {
    const tree = [
      {
        id: "1",
        ord: 10,
        name: "Root",
        children: [
          {
            id: "1_2",
            ord: 20,
            name: "A Child B",
          },
          {
            id: "1_1",
            ord: 10,
            name: "B Child A",
          },
        ],
      },
    ];

    expect(tree[0].children[0].ord).toBe(20);

    const map = getMap(tree);

    const sortedTree = getTree(map, "children", "parentId", "ord", "asc");

    expect(sortedTree[0].children[0].id).toBe("1_1");
    expect(sortedTree[0].children[1].id).toBe("1_2");

    const sortedTreeDesc = getTree(map, "children", "parentId", "ord", "desc");

    expect(sortedTreeDesc[0].children[0].id).toBe("1_2");
    expect(sortedTreeDesc[0].children[1].id).toBe("1_1");
  });

  test("getTree with custom sorting fn", () => {
    const tree = [
      {
        id: "1",
        ord: 10,
        name: "Root",
        children: [
          {
            id: "1_2",
            ord: 20,
            name: "A Child B",
          },
          {
            id: "1_1",
            ord: 10,
            name: "B Child A",
          },
        ],
      },
    ];

    const map = getMap(tree);

    const sortedTreeWithFn = getTree(
      map,
      "children",
      "parentId",
      (a, b) => a.ord - b.ord,
      "asc"
    );

    expect(sortedTreeWithFn[0].children[0].id).toBe("1_1");
    expect(sortedTreeWithFn[0].children[1].id).toBe("1_2");

    const sortedTreeWithFnDesc = getTree(
      map,
      "children",
      "parentId",
      (a, b) => a.ord - b.ord,
      "desc"
    );

    expect(sortedTreeWithFnDesc[0].children[0].id).toBe("1_2");
    expect(sortedTreeWithFnDesc[0].children[1].id).toBe("1_1");
  });

  test("getTree with custom comparator", () => {
    const tree = [
      {
        id: "1",
        ord: 10,
        name: "Root",
        children: [
          {
            id: "1_2",
            ord: 20,
            name: "A Child B",
          },
          {
            id: "1_1",
            ord: 10,
            name: "B Child A",
          },
        ],
      },
    ];

    const map = getMap(tree);

    const withCustomComparator = getTree(map, "children", "parentId", (a, b) =>
      a.name.localeCompare(b.name)
    );
    const root1 = withCustomComparator.find((n) => n.id === "1");
    expect(root1?.children[0].id).toBe("1_2");
    expect(root1?.children[1].id).toBe("1_1");
  });
});
