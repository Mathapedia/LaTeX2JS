import LaTeX2JS from 'latex2js';
import latex from './latex.vue';
declare const install: (Vue: any, config?: any) => void;
declare const VueCodemirror: {
    LaTeX2JS: typeof LaTeX2JS;
    latex: import("vue").DefineComponent<{}, {}, any>;
    install: (Vue: any, config?: any) => void;
};
export default VueCodemirror;
export { LaTeX2JS, latex, install };
