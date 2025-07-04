import { psgraph } from '@latex2js/pstricks';
import * as d3 from 'd3';
export default function render(that) {
    const size = psgraph.getSize.call(that);
    const width = `${size.width}px`;
    const height = `${size.height}px`;
    const div = document.createElement('div');
    div.className = 'pspicture';
    div.style.width = width;
    div.style.height = height;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    var d3svg = d3.select(svg);
    that.$el = div;
    psgraph.pspicture.call(that, d3svg);
    div.appendChild(svg);
    const { env, plot } = that;
    const { sliders } = env;
    if (sliders && sliders.length) {
        sliders.forEach((slider) => {
            const { latex, scalar, variable, value, min, max } = slider;
            const onChange = (event) => {
                const target = event.target;
                var val = Number(target.value) / scalar;
                if (!env.variables)
                    env.variables = {};
                env.variables[variable] = val;
                d3svg.selectAll('.psplot').remove();
                Object.entries(plot).forEach(([k, plotData]) => {
                    if (k.match(/psplot/)) {
                        plotData.forEach((data) => {
                            const d = data.fn.call(data.env, data.match);
                            if (psgraph[k] && d && d3svg) {
                                psgraph[k].call(d, d3svg);
                            }
                        });
                    }
                });
            };
            const label = document.createElement('label');
            const text = document.createTextNode(latex);
            const input = document.createElement('input');
            input.setAttribute('min', String(min * scalar));
            input.setAttribute('max', String(max * scalar));
            input.setAttribute('type', 'range');
            input.setAttribute('value', value);
            label.appendChild(text);
            label.appendChild(input);
            div.appendChild(label);
            input.addEventListener('input', (event) => {
                onChange(event);
            });
        });
    }
    return div;
}
