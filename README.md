# ESLint plugin of Chakra UI

## What's this?

Rules enforcing best practices and consistency using [Chakra UI](https://chakra-ui.com/).

For now, this plugin only supports sorting properties.

![eslintChakraUI](https://user-images.githubusercontent.com/63000297/150904856-cc32ea69-f68e-4dbf-ab42-effcef15378e.gif)

## For potensial users

@Monchi created similar plugin at the same time. Since it's better to collaborate, @no-yan will focus on contributing to his library.
I recommend you to try his one too.

[Monchi/eslint-plugin-chakra-ui](https://github.com/Monchi/eslint-plugin-chakra-ui)


It has two advantages over mine, which are parser and other rules.

- Analysis using type information: Though it has an overhead in execution speed, but it can reduce false positives with flow analysis.

- Other rules: It offers [chakra-ui/props-shorthand](https://github.com/Monchi/eslint-plugin-chakra-ui/blob/master/docs/rules/props-shorthand.md) rule.


## LICENSE

MIT
