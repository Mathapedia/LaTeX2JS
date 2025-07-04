declare module 'latex2js' {
  interface LaTeX2JSClass {
    Text: any;
    Headers: any;
    Environments: any;
    Ignore: any;
    PSTricks: any;
    Views: any;
    Delimiters: any;
    new(Text?: any, Headers?: any, Environments?: any, Ignore?: any, PSTricks?: any, Views?: any): LaTeX2JSClass;
    addEnvironment(name: string): void;
    addView(name: string, options: any): void;
    addText(name: string, exp: RegExp, func: Function): void;
    addHeaders(name: string, begin?: string, end?: string): void;
    getParser(): any;
    parse(text: string): any[];
  }
  
  const LaTeX2JS: LaTeX2JSClass;
  export default LaTeX2JS;
}
