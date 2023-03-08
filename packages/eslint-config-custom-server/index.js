module.exports = {
  plugins: ["@typescript-eslint"],
  parser: '@typescript-eslint/parser',
  extends: [
    "turbo",
    "prettier",
    "plugin:@typescript-eslint/recommended",
  ],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  overrides: [
    {
      files: ["**/__tests__/**/*"],
      env: {
        jest: true,
      },
    },
  ],
};
