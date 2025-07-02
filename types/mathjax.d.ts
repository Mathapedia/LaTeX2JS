declare global {
  interface Window {
    MathJax: any;
  }
  
  var MathJax: {
    Hub: {
      Config: (options: any) => void;
    };
  };
}

export {};
