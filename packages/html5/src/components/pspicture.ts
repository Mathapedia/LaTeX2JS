import { psgraph } from '@latex2js/pstricks';
import { select } from '@latex2js/utils';

interface ComponentProps {
  env: {
    sliders?: Array<{
      latex: string;
      scalar: number;
      variable: string;
      value: string;
      min: number;
      max: number;
    }>;
    variables?: { [key: string]: number };
  };
  plot: { [key: string]: any };
  [key: string]: any;
}

export default function render(that: ComponentProps): HTMLDivElement {
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
  var svgEl = select(svg);
  (that as any).$el = div;
  psgraph.pspicture.call(that, svgEl);
  div.appendChild(svg);

  const { env, plot } = that;
  const { sliders } = env;

  if (sliders && sliders.length) {
    sliders.forEach((slider: any) => {
      const { latex, scalar, variable, value, min, max } = slider;

      const onChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        var val = Number(target.value) / scalar;
        if (!env.variables) env.variables = {};
        env.variables[variable] = val;

        svgEl.selectAll('.psplot').remove();
        Object.entries(plot).forEach(([k, plotData]: [string, any]) => {
          if (k.match(/psplot/)) {
            plotData.forEach((data: any) => {
              const d = data.fn.call(data.env, data.match);
              if (psgraph[k] && d && svgEl) {
                psgraph[k].call(d, svgEl);
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
