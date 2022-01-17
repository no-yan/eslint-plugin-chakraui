import { isHooks } from "./isHooks";
import { ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier } from "estree";

// Be sure to create `new Map` in each rule,
// and `Map.prototype.clear()` in "Program:exit" to prevent memory leak.
export function updateImportedMap(importedMap: Map<string, true>, importDeclaration: ImportDeclaration) {
  const importedList = importDeclaration.specifiers;
  const from = importDeclaration.source.value;
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
}
