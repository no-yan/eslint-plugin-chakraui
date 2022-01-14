import { Rule } from "eslint";
import { Node } from "estree";
// Identifier.property[
const rule: Rule.RuleModule = {
  create: context => {
    return {
      "JSXAttribute > JSXIdentifier[name='height']": (node: Node) => {
        context.report({
          message: "Don't use 'height'",
          node,
        });
      },
    };
  },
};

export = rule;
