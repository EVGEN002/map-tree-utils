import { describe, test, expect } from "bun:test";
import { getTree, getMap } from "../main";

describe("map-tree-utils", () => {
  test("converts flat map to tree", () => {
    const map = new Map([
      ["1", { id: "1", name: "Root", parentId: null }],
      ["1_1", { id: "2", name: "Child A", parentId: "1" }],
      ["1_2", { id: "3", name: "Child B", parentId: "1" }],
      ["4", { id: "4", name: "Grandchild", parentId: "1_1" }],
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

    console.log(map.get("1"));

    expect(map.get("1")?.parentId).toBe(null);
    expect(map.get("1_1")?.parentId).toBe("1");
    expect(map.get("1_1_1")?.parentId).toBe("1_1");
    expect(map.get("1_1_1")?.name).toBe("Grandchild");
  });
});
