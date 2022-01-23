type priority = {};
type Shorthanded<Key extends `${Redundant}${string}`, Redundant extends string> = Key extends `${Redundant}${infer T}`
  ? Uncapitalize<T>
  : never;
const propsPriority = [];

// TODO: concider theme keys?

const margin = [
  "m",
  "margin",
  "mt",
  "marginTop",
  "mr",
  "marginRight",
  "me",
  "marginEnd",
  "mb",
  "marginBotto",
  "ml",
  "marginLeft",
  "ms",
  "marginStart",
  "mx",
  "my",
] as const;

const padding = [
  "p",
  "padding",
  "pt",
  "paddingTop",
  "pr",
  "paddingRight",
  "pe",
  "paddingEnd",
  "pb",
  "paddingBotto",
  "pl",
  "paddingLeft",
  "ps",
  "paddingStart",
  "px",
  "py",
] as const;
const space = [...margin, ...padding];

const color = ["color", "bg", "bgColor", "opacity"] as const;

const gradient = ["bgGradient", "bgClip", "backgroundClip"] as const;

const typography = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "fontStyle",
  "textTransform",
  "textDecoration",
] as const;

const layout = [
  "w",
  "width",
  "h",
  "height",
  "minW",
  "minWidth",
  "maxW",
  "maxWidth",
  "minH",
  "minHeight",
  "maxH",
  "maxHeight",
  "d",
  "display",
  "boxSize",
  "verticalAlign",
  "overflow",
  "overflowX",
  "overflowY",
] as const;

const flexBox = [
  "alignItems",
  "alignContent",
  "justifyItems",
  "justifyContent",
  "flexWrap",
  "flexDirection",
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "justifySelf",
  "alignSelf",
  "order",
] as const;

// only work if will only work if you use the Flex component.
const flexBoxShortHand = ["align", "justify", "wrap", "direction"] as const;

const grid = [
  "gridGap",
  "gridRowGap",
  "gridColumnGap",
  "gridColumn",
  "gridRow",
  "gridArea",
  "gridAutoFlow",
  "gridAutoRows",
  "gridAutoColumns",
  "gridTemplateRows",
  "gridTemplateColumns",
  "gridTemplateAreas",
] as const;

type Grid = typeof grid;
type GridSh = Shorthanded<Grid[number], "grid">;

// only work if you use the Grid component.
const gridShorhand: readonly GridSh[] = [
  "gap",
  "rowGap",
  "columnGap",
  "column",
  "row",
  "area",
  "autoFlow",
  "autoRows",
  "autoColumns",
  "templateRows",
  "templateColumns",
  "templateAreas",
] as const;

const background = [
  "bg",
  "background",
  "bgImage",
  "backgroundImage",
  "bgSize",
  "backgroundSize",
  "bgPosition",
  "backgroundPosition",
  "bgRepeat",
  "backgroundRepeat",
  "bgAttachment",
  "backgroundAttachment",
] as const;

const borders = [
  "border",
  "borderWidth",
  "borderStyle",
  "borderColor",
  "borderTop",
  "borderTopWidth",
  "borderTopStyle",
  "borderTopColor",
  "borderRight",
  "borderEnd",
  "borderRightWidth",
  "borderEndWidth",
  "borderRightStyle",
  "borderEndStyle",
  "borderRightColor",
  "borderEndColor",
  "borderBottom",
  "borderBottomWidth",
  "borderBottomStyle",
  "borderBottomColor",
  "borderLeft",
  "borderStart",
  "borderLeftWidth",
  "borderStartWidth",
  "borderLeftStyle",
  "borderStartStyle",
  "borderLeftColor",
  "borderStartColor",
  "borderX",
  "borderY",
] as const;

const borderRadius = [
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopStartRadius",
  "border",
  "borderTopRightRadius",
  "borderTopEndRadius",
  "border",
  "borderBottomRightRadius",
  "borderBottomEndRadius",
  "border",
  "borderBottomLeftRadius",
  "borderBottomStartRadius",
  "border",
  "borderTopRadius",
  "borderRightRadius",
  "borderEndRadius",
  "borderBottomRadius",
  "borderLeftRadius",
  "borderStartRadius",
] as const;

const position = ["pos", "zIndex", "top", "right", "bottom", "left"] as const;

const shadow = ["textShadow", "shadow", "boxShadow"] as const;

const pseudo = [
  "_hover",
  "_active",
  "_focus",
  "_highlighted",
  "_focusWithin",
  "_focusVisible",
  "_disabled",
  "_readOnly",
  "_before",
  "_after",
  "_empty",
  "_expanded",
  "_checked",
  "_grabbed",
  "_pressed",
  "_invalid",
  "_valid",
  "_loading",
  "_selected",
  "_hidden",
  "_autofill",
  "_even",
  "_odd",
  "_first",
  "_last",
  "_notFirst",
  "_notLast",
  "_visited",
  "_activeLink",
  "_indeterminate",
  "_groupHover",
  "_groupFocus",
  "_groupActive",
  "groupDisabled",
  "_groupInvalid",
  "_groupChecked",
  "_placeholder",
  "_fullScreen",
  "_selection",
] as const;

const misc = [
  "animation",
  "appearance",
  "transform",
  "transformOrigin",
  "visibility",
  "whiteSpace",
  "userSelect",
  "pointerEvents",
  "wordBreak",
  "overflowWrap",
  "textOverflow",
  "boxSizing",
  "cursor",
  "resize",
  "transition",
  "objectFit",
  "objectPosition",
  "float",
  "fill",
  "stroke",
  "outline",
] as const;

const _as = ["as"] as const;

const styleProps = {
  _as,
  space,
  color,
  gradient,
  typography,
  layout,
  flexBox,
  flexBoxShortHand,
  grid,
  gridShorhand,
  background,
  borders,
  borderRadius,
  position,
  shadow,
  pseudo,
  misc,
} as const;
type stylePropsKey = keyof typeof styleProps;

type StylePropsPriority<Key extends stylePropsKey> = {
  [K in Key]: any; // TODO: remove any
};

const stylePropsPriority: StylePropsPriority<stylePropsKey> = {
  _as: 0,
  // Positioning
  position: 1,

  // Box Model
  flexBox: 2,
  flexBoxShortHand: 2,
  grid: 3,
  gridShorhand: 3,
  layout: 4,
  space: 5,

  // Typography
  color: 6,
  typography: 6,

  // Visual
  // bgColor is not contained.
  background: 7,
  gradient: 8,
  borders: 9,
  borderRadius: 10,

  shadow: 11,
  pseudo: 12,
  misc: 13,
};

const x = {};