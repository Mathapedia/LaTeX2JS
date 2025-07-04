import { jsx as _jsx } from "react/jsx-runtime";
import macroStr from '@latex2js/macros';
export default () => (_jsx("div", { style: { display: 'none' }, dangerouslySetInnerHTML: { __html: macroStr } }));
