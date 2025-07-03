export declare const Expressions: {
    pspicture: RegExp;
    psframe: RegExp;
    psplot: RegExp;
    psarc: RegExp;
    pscircle: RegExp;
    pspolygon: RegExp;
    psaxes: RegExp;
    slider: RegExp;
    psline: RegExp;
    userline: RegExp;
    uservariable: RegExp;
    rput: RegExp;
    psset: RegExp;
};
export interface PSTricksContext {
    variables: {
        [key: string]: any;
    };
    sliders: any[];
    xunit: number;
    yunit: number;
    w: number;
    h: number;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    userx?: any;
    usery?: any;
}
export declare const Functions: {
    slider(this: PSTricksContext, m: any): {
        scalar: number;
        min: number;
        max: number;
        variable: any;
        latex: any;
        value: number;
    };
    pspicture(this: PSTricksContext, m: any): {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    } & {
        w: number;
        h: number;
    };
    psframe(this: PSTricksContext, m: any): {
        x1: any;
        y1: any;
        x2: any;
        y2: any;
    };
    pscircle(this: PSTricksContext, m: any): {
        cx: any;
        cy: any;
        r: number;
    };
    psaxes(this: PSTricksContext, m: any): any;
    psplot(this: PSTricksContext, m: any): any;
    pspolygon(this: PSTricksContext, m: any): {
        linecolor: string;
        linestyle: string;
        fillstyle: string;
        fillcolor: string;
        linewidth: number;
        data: number[];
    } | undefined;
    psarc(this: PSTricksContext, m: any): any;
    psline(this: PSTricksContext, m: any): any;
    uservariable(this: PSTricksContext, m: any): {
        name: any;
        x: any;
        y: any;
        func: any;
        value: any;
    };
    userline(this: PSTricksContext, m: any): {
        x1: any;
        y1: any;
        x2: any;
        y2: any;
        xExp: any;
        yExp: any;
        xExp2: any;
        yExp2: any;
        userx: (coords: number[]) => any;
        usery: (coords: number[]) => any;
        userx2: (coords: number[]) => any;
        usery2: (coords: number[]) => any;
        linecolor: string;
        linestyle: string;
        fillstyle: string;
        fillcolor: string;
        linewidth: number;
        arrows: any;
        dots: any;
    };
    rput(this: PSTricksContext, m: any): {
        x: any;
        y: any;
        text: any;
    };
    psset(this: PSTricksContext, m: any): {};
};
declare const _default: {
    Expressions: {
        pspicture: RegExp;
        psframe: RegExp;
        psplot: RegExp;
        psarc: RegExp;
        pscircle: RegExp;
        pspolygon: RegExp;
        psaxes: RegExp;
        slider: RegExp;
        psline: RegExp;
        userline: RegExp;
        uservariable: RegExp;
        rput: RegExp;
        psset: RegExp;
    };
    Functions: {
        slider(this: PSTricksContext, m: any): {
            scalar: number;
            min: number;
            max: number;
            variable: any;
            latex: any;
            value: number;
        };
        pspicture(this: PSTricksContext, m: any): {
            x0: number;
            y0: number;
            x1: number;
            y1: number;
        } & {
            w: number;
            h: number;
        };
        psframe(this: PSTricksContext, m: any): {
            x1: any;
            y1: any;
            x2: any;
            y2: any;
        };
        pscircle(this: PSTricksContext, m: any): {
            cx: any;
            cy: any;
            r: number;
        };
        psaxes(this: PSTricksContext, m: any): any;
        psplot(this: PSTricksContext, m: any): any;
        pspolygon(this: PSTricksContext, m: any): {
            linecolor: string;
            linestyle: string;
            fillstyle: string;
            fillcolor: string;
            linewidth: number;
            data: number[];
        } | undefined;
        psarc(this: PSTricksContext, m: any): any;
        psline(this: PSTricksContext, m: any): any;
        uservariable(this: PSTricksContext, m: any): {
            name: any;
            x: any;
            y: any;
            func: any;
            value: any;
        };
        userline(this: PSTricksContext, m: any): {
            x1: any;
            y1: any;
            x2: any;
            y2: any;
            xExp: any;
            yExp: any;
            xExp2: any;
            yExp2: any;
            userx: (coords: number[]) => any;
            usery: (coords: number[]) => any;
            userx2: (coords: number[]) => any;
            usery2: (coords: number[]) => any;
            linecolor: string;
            linestyle: string;
            fillstyle: string;
            fillcolor: string;
            linewidth: number;
            arrows: any;
            dots: any;
        };
        rput(this: PSTricksContext, m: any): {
            x: any;
            y: any;
            text: any;
        };
        psset(this: PSTricksContext, m: any): {};
    };
};
export default _default;
