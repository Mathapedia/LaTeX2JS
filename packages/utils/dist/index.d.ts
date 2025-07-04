export declare const simplerepl: (regex: RegExp, replace: string) => (_m: any, contents: string) => string;
export declare const matchrepl: (regex: RegExp, callback: (match: RegExpMatchArray) => string) => (m: any, contents: string) => string;
export declare const convertUnits: (value: string) => number;
export declare const RE: {
    options: string;
    type: string;
    squiggle: string;
    squiggleOpt: string;
    coordsOpt: string;
    coords: string;
};
export declare const parseOptions: (opts: string) => {
    [key: string]: string;
};
export declare const parseArrows: (m: string) => {
    arrows: number[];
    dots: number[];
};
export declare const evaluate: (this: any, exp: string) => any;
export declare const X: (this: any, v: number | string) => number;
export declare const Xinv: (this: any, v: number | string) => any;
export declare const Y: (this: any, v: number | string) => number;
export declare const Yinv: (this: any, v: number | string) => number;
export declare const arrowType: (m: string) => {
    arrows: number[];
    dots: number[];
};
export declare const dotType: (m: string) => {
    arrows: number[];
    dots: number[];
};
export { SVGSelection, select } from './svg-utils';
