declare module '@latex2js/utils' {
  export function matchrepl(regex: RegExp, replacer: (match: RegExpMatchArray) => string): (match: RegExpMatchArray[], contents: string) => string;
  export function simplerepl(regex: RegExp, replacement: string): (match: RegExpMatchArray[], contents: string) => string;
  export function convertUnits(value: string): number;
  export function X(x: number): number;
  export function Xinv(x: number): number;
  export function Y(y: number): number;
  export function Yinv(y: number): number;
}
