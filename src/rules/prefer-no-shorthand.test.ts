import { shorthands } from "./../utils/shorthandsTable";
import { RuleTester } from "eslint";
import rule from "./prefer-no-shorthand";
const tester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: { ecmaFeatures: { jsx: true } },
});

tester.run("prefer-no-shorthand", rule, {
  valid: [
    { code: "(props: Props) =><Box height='1'>hello</Box>" },
    { code: "(props: Props) =><Button height={1}>hello</Button>" },
    { code: "(props: Props) =><Flex height={1}>hello</Flex>" },
    { code: "(props: Props) =><NonChakra h={1}>hello</NonChakra>" },
  ],
  invalid: [
    // {
    //   code: "(props: Props) =><Box h='1'/>",
    //   errors: [{ message: "Don't use 'h', use instead 'height'" }],
    //   output: "(props: Props) =><Box height='1'/>",
    // },
  ],
});
