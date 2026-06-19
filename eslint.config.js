const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      ".pip-tmp/**",
      ".pytest_cache/**",
      ".python-deps/**",
      ".venv/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
    ],
  },
  {
    files: ["**/__tests__/**/*.{ts,tsx}", "jest.setup.ts"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);
