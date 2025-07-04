export declare const DEFAULT_CONFIG: {
    tex: {
        inlineMath: string[][];
        displayMath: string[][];
        processEscapes: boolean;
        processEnvironments: boolean;
        packages: string[];
    };
    chtml: {
        linebreaks: {
            automatic: boolean;
            width: string;
        };
    };
    startup: {
        ready: () => void;
    };
};
export declare const getMathJax: () => any;
export declare const loadMathJax: (callback?: () => void, config?: {
    tex: {
        inlineMath: string[][];
        displayMath: string[][];
        processEscapes: boolean;
        processEnvironments: boolean;
        packages: string[];
    };
    chtml: {
        linebreaks: {
            automatic: boolean;
            width: string;
        };
    };
    startup: {
        ready: () => void;
    };
}) => Promise<void>;
