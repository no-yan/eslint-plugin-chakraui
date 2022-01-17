import { RuleTester } from "eslint";
import rule from "./props-order";
const tester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: { ecmaFeatures: { jsx: true } },
});

tester.run("props-order", rule, {
  valid: [
    {
      code: `
      import {Button} from '@chakra-ui/react';
      const Ui = (props: Props) =><Button height={1}>hello</Button>
      `,
    },
  ],
  invalid: [
    {
      code: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box height={1} size={"md"} fontSize={"xl"} bg={"gray.200"}/>
      `,
      errors: [{ message: "invalid order" }],
      output: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box bg={"gray.200"} fontSize={"xl"} height={1} size={"md"} />
      `,
    },
  ],
});
