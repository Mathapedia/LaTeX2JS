declare module '@latex2js/react' {
  import { Component } from 'react';
  
  interface LaTeXProps {
    content: string;
    [key: string]: any;
  }
  
  export class LaTeX extends Component<LaTeXProps> {}
}
