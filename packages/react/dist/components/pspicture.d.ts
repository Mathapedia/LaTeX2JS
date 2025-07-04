interface PspictureProps {
    env: {
        sliders?: Array<{
            latex: string;
            scalar: number;
            variable: string;
            value: string;
            min: number;
            max: number;
        }>;
        variables?: {
            [key: string]: number;
        };
    };
    plot: {
        [key: string]: any;
    };
    [key: string]: any;
}
declare const _default: (props: PspictureProps) => import("react/jsx-runtime").JSX.Element;
export default _default;
