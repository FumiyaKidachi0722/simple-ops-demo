import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "coverage/**",
      "public/**",
      "src/components/ui/**",
    ],
  },

  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    settings: {
      "import/resolver": {
        typescript: {
          // : "./tsconfig.json", // 複数 tsconfig がある場合に指定
        },
      },
    },
    rules: {
      "simple-import-sort/imports": [
        "warn",
        {
          groups: [
            [
              "^node:",
              `^(${[
                "assert",
                "buffer",
                "child_process",
                "cluster",
                "console",
                "constants",
                "crypto",
                "dgram",
                "dns",
                "domain",
                "events",
                "fs",
                "http",
                "http2",
                "https",
                "inspector",
                "module",
                "net",
                "os",
                "path",
                "perf_hooks",
                "process",
                "punycode",
                "querystring",
                "readline",
                "repl",
                "stream",
                "string_decoder",
                "sys",
                "timers",
                "tls",
                "tty",
                "url",
                "util",
                "v8",
                "vm",
                "zlib",
              ].join("|")})(/|$)`,
            ],
            ["^react$", "^@?\\w"],
            ["^(@|~|src)(/.*|$)"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\.(?!/?$)", "^\\./?$"],
            ["^type\\s"],
            ["^.+\\.s?css$", "^.+\\.(png|jpe?g|gif|svg|webp|avif)$"],
          ],
        },
      ],
      "simple-import-sort/exports": "warn",

      "import/first": "warn",
      "import/no-duplicates": "warn",
      "import/newline-after-import": ["warn", { count: 1 }],
      "import/no-useless-path-segments": ["warn", { noUselessIndex: true }],

      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-unused-vars": ["off"],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", disallowTypeAnnotations: false },
      ],

      "sort-imports": [
        "warn",
        {
          ignoreDeclarationSort: true,
          ignoreCase: true,
        },
      ],

      "prefer-const": ["warn", { destructuring: "all" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default eslintConfig;
