import path, { resolve, join } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: resolve("./src/main.ts"),
      name: "map-tree-utils",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
