module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "turbo",
    "prettier",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    "jsx-a11y/anchor-is-valid": "off",
    "react/no-direct-mutation-state": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unescaped-entities": "off",
    "react/react-in-jsx-scope": "off"
  }
};
