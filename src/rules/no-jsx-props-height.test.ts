import { RuleTester } from "eslint";
import rule from "./no-jsx-button";

const tester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: { ecmaFeatures: { jsx: true } },
});

tester.run("no-function-apply", rule, {
  valid: [
    { code: `(props) => <div />` },
    { code: `(props) => <div width='0'/>` },
    { code: `(props:Props) => <div onClick=''/>` },
  ],
  invalid: [{ code: `(props) => <button height='1'/>`, errors: [{ message: "Don't use '<button>'" }] }],
});
