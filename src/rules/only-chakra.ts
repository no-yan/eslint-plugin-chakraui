import { isHooks } from "../utils/isHooks";
import { Rule } from "eslint";
import { Identifier, ImportDeclaration } from "estree";

const rule: Rule.RuleModule = {
  create: context => {
    const importedMap = new Map<string, true>();

    const isChakraComponent = (node: Identifier) => {
      const componentName = node.name;
      const doesExist = importedMap.get(componentName);
      if (doesExist) {
        return true;
      }
      return false;
    };

    return {
      ImportDeclaration: (node: ImportDeclaration) => {
        const importedList = node.specifiers;
        const from = node.source.value;
        // TODO: support other case than '@chakra-ui/react';
        // TODO: consider case of `import {Box as ChakraBox} from '~~'`.
        if (from !== "@chakra-ui/react") {
          return;
        }

        for (let i = 0; i < importedList.length; i++) {
          const imported = importedList[i];

          let maybeComponent;
          switch (imported.type) {
            case "ImportSpecifier":
              maybeComponent = imported.local.name;
              break;
            case "ImportDefaultSpecifier":
              maybeComponent = imported.local.name;
              break;
            case "ImportNamespaceSpecifier":
              // TODO:
              break;
          }

          // Still 3 kind of possibility: Chakra Component, Chakra Hooks, undefined.
          if (maybeComponent !== undefined && !isHooks(maybeComponent)) {
            const compoenent = maybeComponent;
            importedMap.set(compoenent, true);
          }
        }
      },
      "JSXIdentifier[name=/^[A-Z].*/]": (node: Identifier) => {
        if (!isChakraComponent(node)) {
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
