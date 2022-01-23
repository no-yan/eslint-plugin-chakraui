import { stylePropsPriority, StypeProps } from "./../utils/getPriority";
import { isChakraComponent } from "./../utils/isChakraComponent";
import { Rule } from "eslint";
import { Identifier, ImportDeclaration, Node } from "estree";
import type { JSXOpeningElement, JSXAttribute } from "estree-jsx";
import { updateImportedMap } from "../utils/updateImportedMap";
import { getPropertyNameAndValue, getPropertyName } from "../utils/getPropertyName";
import { stylePropsGroup, StyleGroupKey } from "../utils/getPriority";

// JSXSpread will be ignored due to potential override.
// e.g. `<Box bg='red' {...props} />` is different with `<Box {...props} bg='red>` if props is {bg:'white'}.

// out-of-place
const sortProperties = (properties: JSXAttribute[], priorityMap: Map<StypeProps | (string & {}), number>) => {
  // "dangerouslySetInnerHTML" for chakra.div
  const RESERVED_PROPS_LIST = ["className", "children", "dangerouslySetInnerHTML", "key", "ref"];

  const getPriority = (property: string) => {
    const result = priorityMap.get(property);
    if (result === undefined) {
      return Number.MAX_SAFE_INTEGER; //TODO:
    }
    return result;
  };

  const compare = (a: string, b: string) => {
    if (RESERVED_PROPS_LIST.includes(a)) {
      return -1;
    }

    if (RESERVED_PROPS_LIST.includes(a)) {
      if (RESERVED_PROPS_LIST.includes(b)) {
        return a < b ? -1 : 1; //same as ~.findIndex(a) < findIndex(b)
      }
      return -1;
    }

    if (RESERVED_PROPS_LIST.includes(b)) {
      return 1;
    }

    type Result = "sameGroup" | "differentGroup";
    const sameGroup = "sameGroup";
    const differentGroup = "differentGroup";
    const aPriority = getPriority(a);
    const bPriority = getPriority(b);
    const result: Result = aPriority === bPriority ? sameGroup : differentGroup;
    switch (result) {
      case "sameGroup":
        return a < b ? -1 : 1;
      case "differentGroup":
        return aPriority < bPriority ? -1 : 1;
      default:
        return 1;
    }
  };

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
      invalidOrder: "'{{target}}' must be listed after '{{afterTarget}}'",
    },
  },
  create: context => {
    const importedMap = new Map<string, true>();
    const priorityMap = new Map<StypeProps | (string & {}), number>();
    for (let _key of Object.keys(stylePropsGroup)) {
      const key = _key as StyleGroupKey;

      for (let property of stylePropsGroup[key]) {
        priorityMap.set(property, stylePropsPriority[key]);
      }
    }
    const removePriorityMap = () => priorityMap.clear();
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
        const unsorted = chakraElement.attributes as unknown as JSXAttribute[];
        const sorted = sortProperties(unsorted, priorityMap);

        const sourceCode = context.getSourceCode();

        let shouldFix = false;
        let reportNodeIndex: number = -1;
        for (let i = 0; i < sorted.length - 1; i++) {
          const currentProp = getPropertyName(unsorted[i]);
          const nextProp = getPropertyName(sorted[i]);
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
        removePriorityMap();
      },
    };
  },
};

export default rule;
