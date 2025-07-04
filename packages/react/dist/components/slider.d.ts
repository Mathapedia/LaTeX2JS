interface SliderProps {
    env: {
        variables?: {
            [key: string]: number;
        };
        [key: string]: any;
    };
    slider: {
        latex: string;
        scalar: number;
        variable: string;
        value: string;
        min: number;
        max: number;
    };
    svgRef: React.RefObject<SVGSVGElement>;
    plot: {
        [key: string]: any;
    };
}
declare const _default: ({ env, slider, svgRef, plot }: SliderProps) => import("react/jsx-runtime").JSX.Element;
export default _default;
