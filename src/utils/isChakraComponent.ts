import { Identifier } from "estree";

// Check if the component is among the components imported from '@chakra-ui/react' in the import statement.
// To use this function, use updateImportedMap in the import statement.
export const isChakraComponent = (jsxIdentifier: Identifier, importedMap: Map<string, true>) => {
  const componentName = jsxIdentifier.name;
  const doesExist = importedMap.get(componentName);
  if (doesExist) {
    return true;
  }
  return false;
};
