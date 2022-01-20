import { isChakraComponent } from "./../utils/isChakraComponent";
import { Rule, SourceCode } from "eslint";
import { Identifier, ImportDeclaration, Node } from "estree";
import type { JSXOpeningElement, JSXAttribute } from "estree-jsx";
import { updateImportedMap } from "../utils/updateImportedMap";

// JSXSpread will be ignored due to potential override.
// e.g. `<Box bg='red' {...props} />` is different with `<Box {...props} bg='red>` if props is {bg:'white'}.

// TODO: supprot reserved words.
// see https://github.com/yannickcr/eslint-plugin-react/blob/master/lib/rules/jsx-sort-props.js
// const RESERVED_PROPS_LIST = [
//   'children',
//   'dangerouslySetInnerHTML',
//   'key',
//   'ref',
// ];

const compare = (a: string, b: string) => {
  // if (a.type === 'JSXSpreadAttribute' || b.type === 'JSXSpreadAttribute'){}
  switch (true) {
    case a < b:
      return -1;
    case a === b:
      return 0;
    default:
      return 1;
  }
};

// out-of-place
const sortProperties = (properties: JSXAttribute[]) => {
  const sorted = properties.slice(0).sort((a, b) => {
    if (!(a.name.type === "JSXIdentifier" && b.name.type === "JSXIdentifier")) {
      return -1;
    }
    const aProperty = a.name.name;
    const bProperty = b.name.name;

    return compare(aProperty, bProperty);
  });

  return sorted;
};

const getPropertyNameAndValue = (node: JSXAttribute, sourceCode: SourceCode) => {
  const propName = node.name.name;
  // This gets full text, like {1}, {"string"}, {Variable}, "string".
  // By keeping it enclosed in brackets or quotes, the logic of replace will be easier.
  const propValue = sourceCode.getText(node.value as unknown as Node);

  return {
    propName,
    propValue,
  };
};

const rule: Rule.RuleModule = {
  meta: {
    fixable: "code",
    messages: {
      invalidOrder: "invalid order",
    },
  },
  create: context => {
    const importedMap = new Map<string, true>();
    return {
      ImportDeclaration: (node: ImportDeclaration) => {
        updateImportedMap(importedMap, node);
      },
      // not supported spreading props yet. (e.g. <Box {...props} key='12'>)
      JSXOpeningElement: (jsxElement: Identifier) => {
        // from incompatibility of 'estree' & 'estree-jsx', we'll use a lot of type assertion.
        const jsxIdentifier = jsxElement.name as unknown as Identifier;
        if (!isChakraComponent(jsxIdentifier, importedMap)) {
          return;
        }

        const chakraElement = jsxElement as unknown as JSXOpeningElement;
        const unsorted = chakraElement.attributes as unknown as JSXAttribute[]; // TODO:check spread
        const sorted = sortProperties(unsorted);

        const sourceCode = context.getSourceCode();

        let shouldFix = false;
        for (let i = 0; i < sorted.length; i++) {
          if (sorted[i].name.name !== unsorted[0].name.name) {
            shouldFix = true;
            break;
          }
        }

        const generateFix = (fixer: Rule.RuleFixer) => {
          const fixingArray: Rule.Fix[] = [];
          for (let i = sorted.length - 1; i >= 0; i--) {
            const node = unsorted[i];
            const sortedNode = sorted[i];
            const { propName: currentProp, propValue: currentValue } = getPropertyNameAndValue(node, sourceCode);
            const { propName: nextProp, propValue: nextValue } = getPropertyNameAndValue(sortedNode, sourceCode);

            if (currentProp !== nextProp) {
              if (typeof currentProp !== "string" || typeof nextProp !== "string") {
                continue;
              }

              const fixName = fixer.replaceText(node.name as unknown as Node, nextProp);
              if (currentValue === undefined || nextValue === undefined) {
                continue;
              }

              const range = node?.value?.range;
              if (!range) {
                continue;
              }
              const fixValue = fixer.replaceTextRange(range, nextValue);
              fixingArray.push(fixValue);
              fixingArray.push(fixName);
            }
          }
          return fixingArray;
        };

        if (shouldFix) {
          const nodeStart = unsorted[0].range?.[0];
          const nodeEnd = unsorted[unsorted.length - 1].range?.[1];
          if (nodeStart === undefined || nodeEnd === undefined) {
            return;
          }
          context.report({
            messageId: "invalidOrder",
            node: jsxElement,
            fix: generateFix,
          });
        }
      },
      "Program:exit": function reportAndReset() {
        importedMap.clear();
      },
    };
  },
};

export = rule;
