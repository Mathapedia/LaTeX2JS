import { jsx as _jsx } from "react/jsx-runtime";
export default ({ lines }) => (_jsx("span", { className: "math nicebox", dangerouslySetInnerHTML: { __html: lines.join('\n') } }));
