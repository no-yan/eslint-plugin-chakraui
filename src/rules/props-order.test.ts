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
    {
      name: "className first",
      code: `
      import {Button } from '@chakra-ui/react';
      const Ui = (props: Props) =><Button className='' height={1}>hello</Button>
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
      name: "real case",
      code: `
      import {
        Box,
        Button,
        Popover,
        PopoverContent,
        PopoverTrigger,
        Text,
    } from '@chakra-ui/react';
    import { RgbaColorPicker } from 'react-colorful';
    <Popover trigger="hover">
        <PopoverTrigger>
            <Button bg={colorScheme} _hover={{ bg: colorScheme }} size="xs">
                color
            </Button>
        </PopoverTrigger>
        <PopoverContent
            top={-1}
            w="min-content"
            p={1}
            bg="transparent"
            //To avoid blur around the picker area, event outside.
            borderColor="transparent"
            border="0px"
            position="relative"
        >
            <PopoverBody>
                <RgbaColorPicker color={color} onChange={setColor} />
            </PopoverBody>
        </PopoverContent>
    </Popover>;
      `,
    },
  ],
  invalid: [
    {
      name: "single line sorting",
      code: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box height={"1"} size={"md"} fontSize={"xl"} bg={"gray.200"}/>
      `,
      errors: [{ messageId: "invalidOrder" }],
      output: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box height={"1"} fontSize={"xl"} bg={"gray.200"} size={"md"}/>
      `,
    },
    // convert from "" to {}
    {
      name: "single line sorting. convert from '' to {}",
      code: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box fontSize={"xl"} height={1} />
      `,
      errors: [{ messageId: "invalidOrder" }],
      output: `
      import {Box} from '@chakra-ui/react';
      const Ui = (props: Props) =><Box height={1} fontSize={"xl"} />
      `,
    },
    {
      name: 'prop={"string"}',
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
          <Box height={1} fontSize={"xl"} bg={"gray.200"} size={"md"} />
        );
        `,
    },
    // multi-line, boolean, className
    {
      name: "Multi Line and boolean",
      code: `
        import { Box } from "@chakra-ui/react";
        <Box
          className={className}
          onStageAnswer={onStageAnswer}
          onCommitAnswer={onCommitAnswer}
          isFocused={isFocused}
          allowMultipleSelection={allowMultipleSelection}
          direction={direction}
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
          direction={direction}
          allowMultipleSelection={allowMultipleSelection}
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
      name: "boolean to boolean",
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
      name: 'boolean to a="1"',
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
      name: "boolean to b={b}",
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
