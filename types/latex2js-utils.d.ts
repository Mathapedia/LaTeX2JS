declare module 'latex2js-utils' {
  export function matchrepl(regex: RegExp, replacer: (match: RegExpMatchArray) => string): (match: RegExpMatchArray[], contents: string) => string;
  export function simplerepl(regex: RegExp, replacement: string): (match: RegExpMatchArray[], contents: string) => string;
}
