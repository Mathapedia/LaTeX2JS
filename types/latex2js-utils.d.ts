declare module '@latex2js/utils' {
  export function matchrepl(regex: RegExp, replacer: (match: RegExpMatchArray) => string): (match: RegExpMatchArray[], contents: string) => string;
  export function simplerepl(regex: RegExp, replacement: string): (match: RegExpMatchArray[], contents: string) => string;
  export function convertUnits(value: string): number;
  export function parseOptions(opts: string): { [key: string]: string };
  export function parseArrows(m: string): { arrows: number[]; dots: number[] };
  export function evaluate(this: any, exp: string): number;
  export function X(this: any, v: number | string): number;
  export function Xinv(this: any, v: number | string): number;
  export function Y(this: any, v: number | string): number;
  export function Yinv(this: any, v: number | string): number;
  export const RE: {
    options: string;
    type: string;
    squiggle: string;
    squiggleOpt: string;
    coordsOpt: string;
    coords: string;
  };
}
