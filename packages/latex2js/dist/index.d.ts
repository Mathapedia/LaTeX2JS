export default class LaTeX2HTML5 {
    Text: any;
    Headers: any;
    Environments: any;
    Ignore: any;
    PSTricks: any;
    Views: any;
    Delimiters: any;
    constructor(Text?: {
        Expressions: {
            emph: RegExp;
            bf: RegExp;
            rm: RegExp;
            sl: RegExp;
            it: RegExp;
            tt: RegExp;
            mdash: RegExp;
            ndash: RegExp;
            openq: RegExp;
            closeq: RegExp;
            TeX: RegExp;
            LaTeX: RegExp;
            vspace: RegExp;
            cite: RegExp;
            href: RegExp;
            img: RegExp;
            set: RegExp;
            youtube: RegExp;
            euler: RegExp;
        };
        Functions: {
            cite: (m: any[], contents: string) => string;
            img: (m: any, contents: string) => string;
            youtube: (m: any, contents: string) => string;
            href: (m: any, contents: string) => string;
            set: (m: any, contents: string) => string;
            euler: (_m: any, contents: string) => string;
            emph: (m: any, contents: string) => string;
            bf: (m: any, contents: string) => string;
            rm: (m: any, contents: string) => string;
            sl: (m: any, contents: string) => string;
            it: (m: any, contents: string) => string;
            tt: (m: any, contents: string) => string;
            ndash: (_m: any, contents: string) => string;
            mdash: (_m: any, contents: string) => string;
            openq: (_m: any, contents: string) => string;
            closeq: (_m: any, contents: string) => string;
            vspace: (_m: any, contents: string) => string;
            TeX: (_m: any, contents: string) => string;
            LaTeX: (_m: any, contents: string) => string;
        };
    }, Headers?: {
        Expressions: {
            bq: RegExp;
            claim: RegExp;
            corollary: RegExp;
            definition: RegExp;
            endclaim: RegExp;
            endcorallary: RegExp;
            enddefinition: RegExp;
            endexample: RegExp;
            endproblem: RegExp;
            endsolution: RegExp;
            endtheorem: RegExp;
            eq: RegExp;
            example: RegExp;
            problem: RegExp;
            proof: RegExp;
            qed: RegExp;
            solution: RegExp;
            theorem: RegExp;
        };
        Functions: {
            bq: () => string;
            claim: () => string;
            corollary: () => string;
            definition: () => string;
            endclaim: () => string;
            endcorollary: () => string;
            enddefinition: () => string;
            endexample: () => string;
            endproblem: () => string;
            endsolution: () => string;
            endtheorem: () => string;
            eq: () => string;
            example: () => string;
            problem: () => string;
            proof: () => string;
            qed: () => string;
            solution: () => string;
            theorem: () => string;
        };
    }, Environments?: string[], Ignore?: RegExp[], PSTricks?: {
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
            slider(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): {
                scalar: number;
                min: number;
                max: number;
                variable: any;
                latex: any;
                value: number;
            };
            pspicture(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): {
                x0: number;
                y0: number;
                x1: number;
                y1: number;
            } & {
                w: number;
                h: number;
            };
            psframe(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): {
                x1: number;
                y1: number;
                x2: number;
                y2: number;
            };
            pscircle(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): {
                cx: number;
                cy: number;
                r: number;
            };
            psaxes(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): any;
            psplot(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): any;
            pspolygon(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): {
                linecolor: string;
                linestyle: string;
                fillstyle: string;
                fillcolor: string;
                linewidth: number;
                data: number[];
            } | undefined;
            psarc(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): any;
            psline(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): any;
            uservariable(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): {
                name: any;
                x: number;
                y: number;
                func: any;
                value: any;
            };
            userline(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): {
                x1: number;
                y1: number;
                x2: number;
                y2: number;
                xExp: any;
                yExp: any;
                xExp2: any;
                yExp2: any;
                userx: (coords: number[]) => number;
                usery: (coords: number[]) => number;
                userx2: (coords: number[]) => number;
                usery2: (coords: number[]) => number;
                linecolor: string;
                linestyle: string;
                fillstyle: string;
                fillcolor: string;
                linewidth: number;
                arrows: number[];
                dots: number[];
            };
            rput(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): {
                x: number;
                y: number;
                text: any;
            };
            psset(this: import("packages/pstricks/dist/lib/pstricks").PSTricksContext, m: any): {};
        };
    }, Views?: {});
    addEnvironment(name: string): void;
    addView(name: string, _options: any): void;
    addText(name: string, exp: RegExp, func: Function): void;
    addHeaders(name: string, begin?: string, end?: string): void;
    getParser(): any;
    parse(text: string): any[];
}
