declare global {
    interface Window {
        MathJax: any;
    }
}
interface MathJaxConfig {
    tex?: {
        inlineMath?: string[][];
        displayMath?: string[][];
        packages?: string[];
        processEscapes?: boolean;
        processEnvironments?: boolean;
    };
    chtml?: {
        fontURL?: string;
        linebreaks?: {
            automatic: boolean;
            width: string;
        };
    };
}
interface MathJaxProviderProps {
    children: any;
    config?: MathJaxConfig;
    loadingComponent?: any;
    className?: string;
}
declare function MathJaxProvider({ children, config, loadingComponent, className }: MathJaxProviderProps): any;
export default MathJaxProvider;
