declare module '@latex2js/mathjax' {
  export function getMathJax(): any;
  export function loadMathJax(callback?: () => void): void;
}
