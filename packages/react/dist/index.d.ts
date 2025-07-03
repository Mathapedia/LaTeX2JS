import * as React from 'react';
declare const Component: typeof React.Component;
import nicebox from './components/nicebox';
import enumerate from './components/enumerate';
import verbatim from './components/verbatim';
import math from './components/math';
import macros from './components/macros';
export { nicebox, enumerate, verbatim, math, macros };
interface LaTeXProps {
    content: string;
}
interface LaTeXState {
    mathJaxLoaded: boolean;
}
export declare class LaTeX extends Component<LaTeXProps, LaTeXState> {
    private containerRef;
    constructor(props: LaTeXProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: LaTeXProps): void;
    onLoad(): void;
    typesetMath: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default LaTeX;
