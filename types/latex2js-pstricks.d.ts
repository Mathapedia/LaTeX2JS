declare module '@latex2js/pstricks' {
  export const pstricks: any;
  export const psgraph: {
    getSize: {
      call(context: any): { width: number; height: number };
    };
    pspicture: {
      call(context: any, d3svg: any): void;
    };
    [key: string]: any;
  };
}
