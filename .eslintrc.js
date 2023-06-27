module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script"
      }
    }
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    semi: 2,
    "no-console": "off",
    "no-control-regex": "off",
    "react/prop-types": 0,
    "react/no-unescaped-entities": "off",
    "no-unused-vars": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "max-lines": ["warn", { max: 500 }],
    "react/display-name": 0
  },
  settings: {
    react: {
      version: "18"
    }
  }
};
