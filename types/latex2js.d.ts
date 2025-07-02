declare module 'latex2js' {
  export default class LaTeX2HTML5 {
    constructor(
      Text?: any,
      Headers?: any,
      Environments?: any,
      Ignore?: any,
      PSTricks?: any,
      Views?: any
    );
    parse(text: string): any[];
    addEnvironment(name: string): void;
    addView(name: string, options: any): void;
    addText(name: string, exp: RegExp, func: Function): void;
    addHeaders(name: string, begin: string, end: string): void;
    getParser(): any;
  }
}
