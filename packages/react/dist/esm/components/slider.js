import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as d3 from 'd3';
import { psgraph } from '@latex2js/pstricks';
export default ({ env, slider, svgRef, plot }) => {
    const { latex, scalar, variable, value, min, max } = slider;
    const onChange = (event) => {
        // update value
        var val = event.target.value / scalar;
        env.variables[variable] = val;
        // update svg
        const svg = d3.select(svgRef.current);
        svg.selectAll('.psplot').remove();
        Object.entries(plot).forEach(([k, plotData]) => {
            if (k.match(/psplot/)) {
                plotData.forEach((data) => {
                    const d = data.fn.call(data.env, data.match);
                    if (psgraph[k] && d && svg) {
                        psgraph[k].call(d, svg);
                    }
                });
            }
        });
    };
    return (_jsxs("label", { children: [latex, _jsx("input", { type: "range", min: min * scalar, max: max * scalar, defaultValue: value, onChange: onChange })] }));
};
