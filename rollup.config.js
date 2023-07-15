import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: `src/js/index.ts`,
    output: {
      file: `./dist/esm/index.js`,
      format: "es",
    },
    plugins: [typescript()],
  },

  {
    input: `src/js/index.ts`,
    output: {
      file: `./dist/cjs/index.js`,
      format: "cjs",
    },
    plugins: [typescript()],
  },

  {
    input: `src/js/index.ts`,
    output: {
      file: `./dist/iife/index.js`,
      format: "iife",
      name: "Gallery",
    },
    plugins: [typescript()],
  },

  {
    input: `src/js/index.ts`,
    output: {
      file: `./dist/iife/index.min.js`,
      format: "iife",
      name: "Gallery",
    },
    plugins: [typescript(), terser()],
  },

  {
    input: `src/js/index.ts`,
    output: {
      file: `./dist/types/index.d.ts`,
      format: "es",
    },
    plugins: [dts()],
  },

  {
    input: `src/scss/index.scss`,
    output: {
      file: `./dist/css/style.css`,
      format: "es",
    },
    plugins: [
      postcss({
        use: ["sass"],
        modules: false,
        extract: true,
      }),
    ],
  },
];

