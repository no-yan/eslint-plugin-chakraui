import { Rule } from "eslint";
import { Identifier } from "estree";
import type { JSXOpeningElement, JSXIdentifier } from "estree-jsx";

const chakraComponentGroup = [
  ["Box", true],
  ["Flex", true],
  ["Button", true],
] as const;
const chakraMap = new Map<string, boolean>(chakraComponentGroup);

// 検討：JSXIdentifierに統一
const isChakraComponent = (node: Identifier | JSXIdentifier) => {
  const componentName = node.name;
  const doesExist = chakraMap.get(componentName);
  if (doesExist) {
    return true;
  }
  return false;
};

const rule: Rule.RuleModule = {
  meta: {
    fixable: "code",
  },
  create: context => {
    return {
      //   "JSXAttribute > JSXIdentifier[name='height'] > ": (node: Identifier) => {
      //     if (isChakraComponent(node)) {
      //       context.report({ message: "Don't use 'non-chakra Component'", node });
      //     }
      //   },
      "JSXAttribute > JSXIdentifier[name='h']": (targetAttribute: Identifier) => {
        // `context.getAncestors` returns an array of the ancestors of the currently-traversed
        // node, starting at the root of the AST and continuing through the direct parent
        // of the current node. This array does not include the currently-traversed node itself.

        // We want to know if the component name belongs to Chakra UI, so we look at the parent element.
        // This is the second-to-last element of the array.
        const ancestorsList = context.getAncestors();
        const JSXOpeningElement = ancestorsList[ancestorsList.length - 2] as unknown as JSXOpeningElement;
        const maybeJSXIdentifier = JSXOpeningElement.name;
        if (!(maybeJSXIdentifier.type === "JSXIdentifier")) {
          return;
        }
        // It is identifier.
        // Because Estree doesn't know JSX syntax, we'll convevrt type from JSXIdentifer from Identifier.
        const identifier = maybeJSXIdentifier as unknown as Identifier;
        if (!isChakraComponent(identifier)) {
          return;
        }

        const fix = (fixer: Rule.RuleFixer) => {
          if (!targetAttribute.range) {
            // guard for undefined
            return null;
          }
          return fixer.replaceTextRange(targetAttribute.range, "height");
        };

        context.report({
          message: "Don't use 'h', use instead 'height'",
          node: targetAttribute,
          fix,
        });
      },
    };
  },
};

export = rule;
