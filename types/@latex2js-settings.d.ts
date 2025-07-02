declare module '@latex2js/settings' {
  export const Expressions: {
    fillcolor: RegExp;
    linecolor: RegExp;
    linewidth: RegExp;
    linestyle: RegExp;
    arrowscale: RegExp;
    arrowinset: RegExp;
    arrowlength: RegExp;
    arrowsize: RegExp;
    dotscale: RegExp;
    dotsize: RegExp;
    gridwidth: RegExp;
    gridcolor: RegExp;
    griddots: RegExp;
    gridlabels: RegExp;
    subgriddiv: RegExp;
    subgridwidth: RegExp;
    subgridcolor: RegExp;
    subgriddots: RegExp;
    ticksize: RegExp;
    axesstyle: RegExp;
    ticks: RegExp;
    labels: RegExp;
    dx: RegExp;
    dy: RegExp;
    Dx: RegExp;
    Dy: RegExp;
    xunit: RegExp;
    yunit: RegExp;
    runit: RegExp;
    origin: RegExp;
    swapaxes: RegExp;
    border: RegExp;
    borderwidth: RegExp;
    bordercolor: RegExp;
  };
  export default class Settings {
    static parse(str: string): any;
  }
}
