import { isChakraComponent } from "./../utils/isChakraComponent";
import { Rule } from "eslint";
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
        const attributes = chakraElement.attributes as unknown as JSXAttribute[]; // TODO:check spread
        const sorted = sortProperties(attributes);

        const sourceCode = context.getSourceCode();

        let sortedText = "";
        for (let i = 0; i < sorted.length; i++) {
          const sortedAttr = sorted[i] as unknown as Node;
          sortedText += sourceCode.getText(sortedAttr) + " ";
        }

        let shouldFix = false;
        for (let i = 0; i < sorted.length; i++) {
          if (sorted[i].name.name !== attributes[0].name.name) {
            shouldFix = true;
            break;
          }
        }
        if (shouldFix) {
          const nodeStart = attributes[0].range?.[0];
          const nodeEnd = attributes[attributes.length - 1].range?.[1];
          if (nodeStart === undefined || nodeEnd === undefined) {
            return;
          }
          context.report({
            messageId: "invalidOrder",
            node: jsxElement,
            fix: function (fixer) {
              return fixer.replaceTextRange([nodeStart, nodeEnd], sortedText);
            },
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
