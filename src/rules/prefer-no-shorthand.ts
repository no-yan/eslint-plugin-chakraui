import { Rule } from "eslint";
import { Identifier, ImportDeclaration } from "estree";
import type { JSXIdentifier } from "estree-jsx";
import { isChakraComponent } from "../utils/isChakraComponent";

const rule: Rule.RuleModule = {
  meta: {
    fixable: "code",
  },
  create: context => {
    const importedMap = new Map<string, true>();

    return {
      ImportDeclaration: (node: ImportDeclaration) => {
        updateImportedMap(importedMap, node);
      },
      "JSXAttribute > JSXIdentifier": (targetAttribute: Identifier) => {
        const property = targetAttribute.name;

        if (!isChakraComponent(targetAttribute, importedMap)) {
          return;
          // const fix = (fixer: Rule.RuleFixer) => {
          //   if (!targetAttribute.range) {
          //     // guard for undefined
          //     return null;
          //   }
          //   return fixer.replaceTextRange(targetAttribute.range, "height");
          // };
        }

        // TODO: chakraのプロパティに`property`があるか確認する。

        context.report({
          message: "Don't use 'h', use instead 'height'",
          node: targetAttribute,
          // fix,
        });
      },
      "Program:exit": function reportAndReset() {
        importedMap.clear();
      },
    };
  },
};

export = rule;
function updateImportedMap(importedMap: Map<string, true>, importedList: any) {
  throw new Error("Function not implemented.");
}
