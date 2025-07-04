import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { psgraph } from '@latex2js/pstricks';
import * as d3 from 'd3';
import { useRef, useEffect } from 'react';
import Slider from './slider';
export default (props) => {
    const svgRef = useRef(null);
    const divRef = useRef(null);
    const size = psgraph.getSize.call(props);
    const width = `${size.width}px`;
    const height = `${size.height}px`;
    useEffect(() => {
        if (svgRef.current && divRef.current) {
            const d3svg = d3.select(svgRef.current);
            const obj = { ...props };
            obj.$el = divRef.current;
            psgraph.pspicture.call(obj, d3svg);
        }
    }, [props]);
    return (_jsxs("div", { className: "pspicture", style: { width: width, height: height }, ref: divRef, children: [_jsx("svg", { width: size.width, height: size.height, ref: svgRef }), props.env.sliders &&
                props.env.sliders.map((slider, index) => {
                    return (_jsx(Slider, { slider: slider, env: props.env, svgRef: svgRef, plot: props.plot }, index));
                })] }));
};
