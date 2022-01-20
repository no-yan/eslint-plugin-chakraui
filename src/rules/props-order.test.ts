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
      const Ui = (props: Props) =><Box height={"1"} size={"md"} fontSize={"xl"} bg={"gray.200"}/>
      `,
      errors: [{ message: "invalid order" }],
      output: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box bg={"gray.200"} fontSize={"xl"} height={"1"} size={"md"}/>
      `,
    },
    {
      code: `
        import {Box} from '@chakra-ui/react';
        const Ui = (props: Props) =><Box height={1} size={"md"} fontSize={"xl"} bg={"gray.200"} />
        `,
      errors: [{ message: "invalid order" }],
      output: `
        import {Box} from '@chakra-ui/react';
        const Ui = (props: Props) =><Box bg={"gray.200"} fontSize={"xl"} height={1} size={"md"} />
        `,
    },
    {
      code: `
        import { Box } from "@chakra-ui/react";
        const Ui = (props: Props) => (
          <Box height={1} size={"md"} fontSize={"xl"} bg={"gray.200"} />
        );
        `,
      errors: [{ message: "invalid order" }],
      output: `
        import { Box } from "@chakra-ui/react";
        const Ui = (props: Props) => (
          <Box bg={"gray.200"} fontSize={"xl"} height={1} size={"md"} />
        );
        `,
    },
    {
      code: `
        import { Box } from "@chakra-ui/react";
        <Box
          className={className}
          onStageAnswer={onStageAnswer}
          onCommitAnswer={onCommitAnswer}
          isFocused={isFocused}
          direction={direction}
          allowMultipleSelection={allowMultipleSelection}
          measureLongestChildNode={measureLongestChildNode}
          layoutItemsSize={layoutItemsSize}
          handleAppScroll={handleAppScroll}
          isActive={isActive}
          resetSelection={resetSelection}
          onKeyboardChoiceHovered={onKeyboardChoiceHovered}
          // keyboardShortcutType
        />;
    `,
      output: `
        import { Box } from "@chakra-ui/react";
        <Box
          allowMultipleSelection={allowMultipleSelection}
          className={className}
          direction={direction}
          handleAppScroll={handleAppScroll}
          isActive={isActive}
          isFocused={isFocused}
          layoutItemsSize={layoutItemsSize}
          measureLongestChildNode={measureLongestChildNode}
          onCommitAnswer={onCommitAnswer}
          onKeyboardChoiceHovered={onKeyboardChoiceHovered}
          onStageAnswer={onStageAnswer}
          resetSelection={resetSelection}
          // keyboardShortcutType
        />;
    `,
      errors: 1,
    },
  ],
});
