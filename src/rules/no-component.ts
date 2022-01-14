import { Rule } from "eslint";
import { Node } from "estree";
// Identifier.property[
const rule: Rule.RuleModule = {
  create: context => {
    return {
      "JSXOpeningElement > JSXIdentifier[name=/^[A-Z].*/]": (node: Node) => {
        context.report({
          message: "Don't use Component, use dom element",
          node,
        });
      },
    };
  },
};

export = rule;
