declare module '@latex2js/pstricks' {
  export interface PSTricksContext {
    [key: string]: any;
  }

  export const psgraph: {
    getSize: () => { width: number; height: number };
    pspicture: (d3svg: any) => void;
    [key: string]: any;
  };

  export const pstricks: {
    [key: string]: any;
  };
}
