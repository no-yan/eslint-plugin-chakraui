import { RuleTester } from "eslint";
import rule from "./only-chakra";
const tester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: { ecmaFeatures: { jsx: true } },
});

tester.run("only use imported chakra component", rule, {
  valid: [
    {
      code: `
        import { Box } from '@chakra-ui/react';
        const Ui = (props: Props) =><Box>hello</Box>
    `,
    },
    {
      code: `
        import { Button } from '@chakra-ui/react';
        const Ui = (props: Props) =><Button>hello</Button>
    `,
    },
    {
      code: `
        import { Button } from '@chakra-ui/react';
        const Ui = (props: Props) =><Button>hello</Button>
    `,
    },
  ],
  invalid: [
    {
      code: `
      import chakra from '@chakra-ui/react';
      const Ui = (props: Props) =><Div/>
    `,
      errors: [{ message: "Div is not chakra Component or not imported." }],
    },
    { code: "(props: Props) =><Button/>", errors: [{ message: "Button is not chakra Component or not imported." }] },
  ],
});
