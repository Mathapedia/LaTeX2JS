declare module '@latex2js/html5' {
  export default class LaTeX2HTML5 {
    constructor(options?: any);
    init(): void;
    parse(tex: string): string;
  }
}
