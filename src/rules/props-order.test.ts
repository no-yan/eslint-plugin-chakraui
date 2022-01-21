import { RuleTester } from "eslint";
import rule from "./props-order";
const tester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: { ecmaFeatures: { jsx: true } },
});

// TODO: Cases that contain comment-out

tester.run("props-order", rule, {
  valid: [
    {
      code: `
      import {Button} from '@chakra-ui/react';
      const Ui = (props: Props) =><Button height={1}>hello</Button>
      `,
    },
    {
      code: `
      import {
        Box,
        Button,
        Collapse,
        Flex,
        Icon,
        IconButton,
        Link,
        Popover,
        PopoverContent,
        PopoverTrigger,
        Stack,
        Text,
        useBreakpointValue,
        useColorModeValue,
        useDisclosure,
    } from '@chakra-ui/react';
      <Popover trigger="hover">
      <PopoverTrigger>
          <Button
              _hover={{ bg: colorScheme }}
              bg={colorScheme}
              size="xs"
          >
              color
          </Button>
      </PopoverTrigger>
      <PopoverContent
          bg="transparent"
          border="0px"
          borderColor="transparent"
          p={1}
          //To avoid blur around the picker area, event outside.
          position="relative"
          top={-1}
          w="min-content"
      >
          <PopoverBody>
              <RgbaColorPicker color={color} onChange={setColor} />
          </PopoverBody>
      </PopoverContent>
  </Popover>
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
          keyboardShortcutType
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
          keyboardShortcutType
          layoutItemsSize={layoutItemsSize}
          measureLongestChildNode={measureLongestChildNode}
          onCommitAnswer={onCommitAnswer}
          onKeyboardChoiceHovered={onKeyboardChoiceHovered}
          onStageAnswer={onStageAnswer}
          resetSelection={resetSelection}
        />;
    `,
      errors: 1,
    },
    {
      code: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box b a />
      `,
      errors: [{ message: "invalid order" }],
      output: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box a b />
      `,
    },
    {
      code: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box b a='1' />
      `,
      errors: [{ message: "invalid order" }],
      output: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box a='1' b />
      `,
    },
    {
      code: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box b={b} a />
      `,
      errors: [{ message: "invalid order" }],
      output: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box a b={b} />
      `,
    },
  ],
});
