import { jsx as _jsx } from "react/jsx-runtime";
export default ({ lines }) => (_jsx("ul", { className: "math", children: lines.map((line) => {
        var m = line.match(/\\item (.*)/);
        if (m) {
            return _jsx("li", { children: m[1] });
        }
        else {
            return line;
        }
    }) }));
