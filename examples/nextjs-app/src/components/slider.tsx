import React from 'react';
import * as d3 from 'd3';

const psgraph: any = {
  psplot(svg: any): void {
    const context = [];
    context.push('M');
    if (this.fillstyle === 'solid') {
      context.push(this.data[0]);
      context.push(0);
    } else {
      context.push(this.data[0]);
      context.push(this.data[1]);
    }
    context.push('L');

    this.data.forEach((data: any) => {
      context.push(data);
    });

    if (this.fillstyle === 'solid') {
      context.push(this.data[this.data.length - 2]);
      context.push(0);
      context.push('Z');
    }

    svg
      .append('svg:path')
      .attr('d', context.join(' '))
      .attr('class', 'psplot')
      .style('stroke', this.linecolor)
      .style('stroke-width', this.linewidth)
      .style('fill', this.fillstyle === 'solid' ? this.fillcolor : 'none')
      .style('stroke-opacity', 1);
  }
};

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
    const svg = d3.select(svgRef.current);
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
