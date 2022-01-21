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

const getPropertyName = (node: JSXAttribute) => {
  // In spec, JSXAttributeName could be either JSXNamespacedName or string.
  // However, React does not support this. So everything can be considered a string.
  // https://github.com/facebook/jsx/issues/13#issuecomment-54373080
  const propName = node.name.name as string;
  return propName;
};

const getPropertyNameAndValue = (node: JSXAttribute, sourceCode: SourceCode) => {
  const propName = getPropertyName(node);

  let propValue;
  if (node.value !== null) {
    // This gets full text, like {1}, {"string"}, {Variable}, "string".
    // By keeping it enclosed in brackets or quotes, the logic of replace will be easier.
    propValue = sourceCode.getText(node.value as unknown as Node);
  } else {
    propValue = undefined;
  }

  return {
    propName,
    propValue,
  };
};

const rule: Rule.RuleModule = {
  meta: {
    fixable: "code",
    messages: {
      invalidOrder: "'{{target}}' must be listed after '{{afterTarget}}'",
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
        let reportNodeIndex: number = -1;
        for (let i = 0; i < sorted.length - 1; i++) {
          const { propName: currentProp } = getPropertyNameAndValue(unsorted[i], sourceCode);
          const { propName: nextProp } = getPropertyNameAndValue(sorted[i], sourceCode);
          if (currentProp !== nextProp) {
            shouldFix = true;
            reportNodeIndex = i;
            if (reportNodeIndex >= sorted.length - 1) {
              // Something went wrong. Instead of annying users for bug message, we prefer return.
              return;
            }

            break;
          }
        }

        const generateFix = (fixer: Rule.RuleFixer): Rule.Fix[] => {
          const fixingArray: Rule.Fix[] = [];
          //Operate from the back so that the position of the unoperated node is not changed.
          // If you start from the front, each time you manipulate the props, the position of the node will shift and break.
          for (let i = sorted.length - 1; i >= 0; i--) {
            const node = unsorted[i];
            const sortedNode = sorted[i];
            const { propName: currentProp, propValue: currentValue } = getPropertyNameAndValue(node, sourceCode);
            const { propName: nextProp, propValue: nextValue } = getPropertyNameAndValue(sortedNode, sourceCode);

            if (currentProp !== nextProp) {
              const fixName = fixer.replaceText(node.name as unknown as Node, nextProp);

              if (currentValue !== undefined && nextValue !== undefined) {
                const range = node?.value?.range;
                if (!range) {
                  continue;
                }
                const fixValue = fixer.replaceTextRange(range, nextValue);
                fixingArray.push(fixValue);
                fixingArray.push(fixName);
              } else {
                // This means, at least one of attributes is boolean(e.g. <Box isHover/>).
                // Since the structure of the AST is different from others, we will replace **node** itself instead of node.name

                let fixNode;
                if (currentValue === undefined && nextValue === undefined) {
                  // from <Box current/> to <Box next/>;
                  fixNode = fixer.replaceText(node.name as unknown as Node, nextProp);
                } else if (currentValue === undefined) {
                  // from <Box boolean/> to <Box a={1}/>
                  fixNode = fixer.replaceText(node as unknown as Node, `${nextProp}=${nextValue}`);
                } else {
                  // nextvalue === undefined.
                  // from <Box a={1}/> to <Box boolean/>
                  fixNode = fixer.replaceText(node as unknown as Node, nextProp);
                }
                fixingArray.push(fixNode);
              }
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
          const reportNode = unsorted[reportNodeIndex];
          const nextToReportNode = unsorted[reportNodeIndex + 1];
          context.report({
            messageId: "invalidOrder",
            data: { target: getPropertyName(reportNode), afterTarget: getPropertyName(nextToReportNode) },
            node: reportNode as unknown as Node,
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
