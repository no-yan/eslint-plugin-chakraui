import { RuleTester } from "eslint";
import rule from "./props-order";
const tester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: { ecmaFeatures: { jsx: true } },
});

// TODO: Cases that contain comment-out
// "eslint-disable-next-line~~~"
// spreading
// key supprot

tester.run("props-order", rule, {
  valid: [
    {
      code: `
      import {Button} from '@chakra-ui/react';
      const Ui = (props: Props) =><Button height={1}>hello</Button>
      `,
    },
    {
      name: "import alias",
      code: `
      import {Button as CButton} from '@chakra-ui/react';
      const Ui = (props: Props) =><CButton height={1}>hello</CButton>
      `,
    },
    //     {
    //       code: `
    //     import {
    //       Drawer
    //   } from '@chakra-ui/react';
    //     <Drawer
    //     finalFocusRef={btnRef}
    //     // eslint-disable-next-line @no-yan/chakraui/props-order
    //     onClose={onClose}
    //     isOpen={isOpen}
    //     placement="right"
    // />`,
    //     },
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
    // one-line sort
    {
      code: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box height={"1"} size={"md"} fontSize={"xl"} bg={"gray.200"}/>
      `,
      errors: [{ messageId: "invalidOrder" }],
      output: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box bg={"gray.200"} fontSize={"xl"} height={"1"} size={"md"}/>
      `,
    },
    // convert from "" to {}
    {
      code: `
        import {Box} from '@chakra-ui/react';
        const Ui = (props: Props) =><Box height={1} fontSize={"xl"} />
        `,
      errors: [{ messageId: "invalidOrder" }],
      output: `
        import {Box} from '@chakra-ui/react';
        const Ui = (props: Props) =><Box fontSize={"xl"} height={1} />
        `,
    },
    {
      code: `
        import { Box } from "@chakra-ui/react";
        const Ui = (props: Props) => (
          <Box height={1} size={"md"} fontSize={"xl"} bg={"gray.200"} />
        );
        `,
      errors: [{ messageId: "invalidOrder" }],
      output: `
        import { Box } from "@chakra-ui/react";
        const Ui = (props: Props) => (
          <Box bg={"gray.200"} fontSize={"xl"} height={1} size={"md"} />
        );
        `,
    },
    // multi-line, boolean, className
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
          className={className}
          allowMultipleSelection={allowMultipleSelection}
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
    // boolean to boolean
    {
      code: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box b a />
      `,
      errors: [{ messageId: "invalidOrder" }],
      output: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box a b />
      `,
    },
    // boolean to string
    {
      code: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box b a='1' />
      `,
      errors: [{ messageId: "invalidOrder" }],
      output: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box a='1' b />
      `,
    },
    // boolean to curly
    {
      code: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box b={b} a />
      `,
      errors: [{ messageId: "invalidOrder" }],
      output: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box a b={b} />
      `,
    },
  ],
});
