import { Rule } from "eslint";
import { Identifier, ImportDeclaration } from "estree";
import { updateImportedMap } from "../utils/updateImportedMap";
import { isChakraComponent } from "../utils/isChakraComponent";
const rule: Rule.RuleModule = {
  create: context => {
    const importedMap = new Map<string, true>();

    return {
      ImportDeclaration: (node: ImportDeclaration) => {
        updateImportedMap(importedMap, node);
      },
      "JSXIdentifier[name=/^[A-Z].*/]": (node: Identifier) => {
        if (!isChakraComponent(node, importedMap)) {
          context.report({ message: `${node.name} is not chakra Component or not imported.`, node });
          return;
        }
      },
      "Program:exit": function reportAndReset() {
        importedMap.clear();
      },
    };
  },
};

export = rule;
