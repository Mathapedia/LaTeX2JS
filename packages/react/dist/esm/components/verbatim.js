import { jsx as _jsx } from "react/jsx-runtime";
export default ({ lines }) => (_jsx("pre", { className: "verbatim", dangerouslySetInnerHTML: { __html: lines.join('\n') } }));
