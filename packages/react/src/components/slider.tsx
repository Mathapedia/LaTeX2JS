import React from 'react';
import { select } from '@latex2js/utils';
import { psgraph } from '@latex2js/pstricks';

interface SliderProps {
  env: {
    variables?: { [key: string]: number };
    [key: string]: any;
  };
  slider: {
    latex: string;
    scalar: number;
    variable: string;
    value: string;
    min: number;
    max: number;
  };
  svgRef: React.RefObject<SVGSVGElement | null>;
  plot: { [key: string]: any };
}

export default ({ env, slider, svgRef, plot }: SliderProps) => {
  const { latex, scalar, variable, value, min, max } = slider;

  const onChange = (event: any) => {
    // update value
    var val = event.target.value / scalar;
    if (!env.variables) {
      env.variables = {};
    }
    env.variables[variable] = val;

    // update svg
    if (svgRef.current) {
      const svg = select(svgRef.current);
      svg.selectAll('.psplot').remove();
    Object.entries(plot).forEach(([k, plotData]: [string, any]) => {
      if (k.match(/psplot/)) {
        plotData.forEach((data: any) => {
          const d = data.fn.call(data.env, data.match);
          if (psgraph[k] && d && svg) {
            psgraph[k].call(d, svg);
          }
        });
      }
    });
    }
  };

  return (
    <label>
      {latex}
      <input
        type="range"
        min={min * scalar}
        max={max * scalar}
        defaultValue={value}
        onChange={onChange}
      />
    </label>
  );
};
