import { RuleTester } from "eslint";
import rule from "./no-component";

const tester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: { ecmaFeatures: { jsx: true } },
});

tester.run("no-component", rule, {
  valid: [{ code: `(props:Props) => <div/>` }],
  invalid: [{ code: `(props:Props) => <Button/>`, errors: [{ message: "Don't use Component, use dom element" }] }],
});
