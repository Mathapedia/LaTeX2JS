import pstricks from './lib/pstricks';
import psgraph from './lib/psgraph';
export { pstricks, psgraph };
declare const _default: {
    pstricks: {
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
            slider(this: import("./lib/pstricks").PSTricksContext, m: any): {
                scalar: number;
                min: number;
                max: number;
                variable: any;
                latex: any;
                value: number;
            };
            pspicture(this: import("./lib/pstricks").PSTricksContext, m: any): {
                x0: number;
                y0: number;
                x1: number;
                y1: number;
            } & {
                w: number;
                h: number;
            };
            psframe(this: import("./lib/pstricks").PSTricksContext, m: any): {
                x1: any;
                y1: any;
                x2: any;
                y2: any;
            };
            pscircle(this: import("./lib/pstricks").PSTricksContext, m: any): {
                cx: any;
                cy: any;
                r: number;
            };
            psaxes(this: import("./lib/pstricks").PSTricksContext, m: any): any;
            psplot(this: import("./lib/pstricks").PSTricksContext, m: any): any;
            pspolygon(this: import("./lib/pstricks").PSTricksContext, m: any): {
                linecolor: string;
                linestyle: string;
                fillstyle: string;
                fillcolor: string;
                linewidth: number;
                data: number[];
            } | undefined;
            psarc(this: import("./lib/pstricks").PSTricksContext, m: any): any;
            psline(this: import("./lib/pstricks").PSTricksContext, m: any): any;
            uservariable(this: import("./lib/pstricks").PSTricksContext, m: any): {
                name: any;
                x: any;
                y: any;
                func: any;
                value: any;
            };
            userline(this: import("./lib/pstricks").PSTricksContext, m: any): {
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
            rput(this: import("./lib/pstricks").PSTricksContext, m: any): {
                x: any;
                y: any;
                text: any;
            };
            psset(this: import("./lib/pstricks").PSTricksContext, m: any): {};
        };
    };
    psgraph: any;
};
export default _default;
