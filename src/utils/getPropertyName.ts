import { SourceCode } from "eslint";
import { Node } from "estree";
import { JSXAttribute } from "estree-jsx";

export const getPropertyName = (node: JSXAttribute) => {
  // In spec, JSXAttributeName could be either JSXNamespacedName or string.
  // However, React does not support this. So everything can be considered a string.
  // https://github.com/facebook/jsx/issues/13#issuecomment-54373080
  const propName = node.name.name as string;
  return propName;
};
export const getPropertyValue = (node: JSXAttribute, sourceCode: SourceCode) => {
  let propValue;
  if (node.value !== null) {
    // This gets full text, like {1}, {"string"}, {Variable}, "string".
    // By keeping it enclosed in brackets or quotes, the logic of replace will be easier.
    propValue = sourceCode.getText(node.value as unknown as Node);
  } else {
    propValue = undefined;
  }
  return propValue;
};
export const getPropertyNameAndValue = (node: JSXAttribute, sourceCode: SourceCode) => {
  const propName = getPropertyName(node);
  const propValue = getPropertyValue(node, sourceCode);

  return {
    propName,
    propValue,
  };
};
