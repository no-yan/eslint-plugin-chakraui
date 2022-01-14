import { RuleTester } from "eslint";
import rule from "./prefer-height";
const tester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: { ecmaFeatures: { jsx: true } },
});

tester.run("prefer-height", rule, {
  valid: [
    { code: "(props: Props) =><Box height='1'>hello</Box>" },
    { code: "(props: Props) =><Button height={1}>hello</Button>" },
  ],
  invalid: [
    {
      code: "(props: Props) =><Box h='1'/>",
      errors: [{ message: "Don't use 'h', use instead 'height'" }],
      output: "(props: Props) =><Box height='1'/>",
    },
  ],
});
