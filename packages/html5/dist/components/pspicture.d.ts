interface ComponentProps {
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
export default function render(that: ComponentProps): HTMLDivElement;
export {};
