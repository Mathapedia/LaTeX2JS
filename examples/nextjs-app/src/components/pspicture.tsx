import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import Slider from './slider';

const psgraph: any = {
  env: null as any,
  getSize(): { width: number; height: number } {
    const padding = 20;
    this.env.scale = 1;
    const goalWidth =
      Math.max(document.documentElement.clientWidth, window.innerWidth || 0) -
      padding;
    if (goalWidth <= this.env.w * this.env.xunit) {
      this.env.scale = goalWidth / this.env.w / this.env.xunit;
    }
    const width: number = this.env.w * this.env.xunit;
    const height: number = this.env.h * this.env.yunit;

    return {
      width,
      height
    };
  },

  pspicture(svg: any): void {
    console.log('psgraph.pspicture called with this:', this);
    console.log('psgraph.pspicture svg:', svg);
    const plot = this.plot || {};
    console.log('psgraph.pspicture plot:', plot);
    
    Object.entries(plot).forEach(([key, plotData]: [string, any]) => {
      console.log('Processing plot entry:', key, plotData);
      if (Array.isArray(plotData)) {
        plotData.forEach((data: any, index: number) => {
          console.log(`Processing plotData[${index}]:`, data);
          if (data.fn && typeof data.fn === 'function') {
            console.log('Calling data.fn with env:', data.env, 'match:', data.match);
            const result = data.fn.call(data.env, data.match);
            console.log('Function result:', result);
            if (result && psgraph[key] && typeof psgraph[key] === 'function') {
              console.log(`Calling psgraph.${key} with result:`, result);
              psgraph[key].call(result, svg);
            } else {
              console.log(`Cannot call psgraph.${key}:`, { result, hasFunction: !!(psgraph[key] && typeof psgraph[key] === 'function') });
            }
          } else {
            console.log('data.fn is not a function:', data.fn);
          }
        });
      } else {
        console.log('plotData is not an array:', plotData);
      }
    });
  },

  psplot(svg: any): void {
    console.log('psgraph.psplot called with this:', this);
    console.log('psgraph.psplot svg:', svg);
    console.log('psgraph.psplot data:', this.data);
    
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

    console.log('SVG path context:', context);
    console.log('SVG path d attribute:', context.join(' '));

    const path = svg
      .append('svg:path')
      .attr('d', context.join(' '))
      .attr('class', 'psplot')
      .style('stroke', this.linecolor)
      .style('stroke-width', this.linewidth)
      .style('fill', this.fillstyle === 'solid' ? this.fillcolor : 'none')
      .style('stroke-opacity', 1);
      
    console.log('SVG path element created:', path);
    console.log('SVG path node:', path.node());
  },

  psaxes(svg: any): void {
    const xaxis = [this.bottomLeft[0], this.topRight[0]];
    const yaxis = [this.bottomLeft[1], this.topRight[1]];
    const origin = this.origin;
    
    if (!this.dx || isNaN(this.dx)) {
      this.dx = 1;
    }
    if (!this.dy || isNaN(this.dy)) {
      this.dy = 1;
    }

    const line = (x1: number, y1: number, x2: number, y2: number): void => {
      svg
        .append('svg:line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .style('stroke-width', 1)
        .style('stroke', 'rgb(0,0,0)')
        .style('stroke-opacity', 1);
    };

    line(xaxis[0], origin[1], xaxis[1], origin[1]); // x-axis
    line(origin[0], yaxis[0], origin[0], yaxis[1]); // y-axis
  },

  psline(svg: any): void {
    svg
      .append('svg:line')
      .attr('x1', this.x1)
      .attr('y1', this.y1)
      .attr('x2', this.x2)
      .attr('y2', this.y2)
      .style('stroke-width', this.linewidth || 1)
      .style('stroke', this.linecolor || 'black')
      .style('stroke-opacity', 1);
  },

  pscircle(svg: any): void {
    svg
      .append('svg:circle')
      .attr('cx', this.cx)
      .attr('cy', this.cy)
      .attr('r', this.r)
      .style('stroke', this.linecolor || 'black')
      .style('fill', 'none')
      .style('stroke-width', this.linewidth || 1)
      .style('stroke-opacity', 1);
  }
};

interface PspictureProps {
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

export default (props: PspictureProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const size = psgraph.getSize.call(props);
  const width = `${size.width}px`;
  const height = `${size.height}px`;

  useEffect(() => {
    console.log('Pspicture useEffect triggered with props:', props);
    if (svgRef.current && divRef.current) {
      console.log('SVG and div refs are available');
      const d3svg = d3.select(svgRef.current);
      const obj = { ...props };
      obj.$el = divRef.current;
      console.log('Calling psgraph.pspicture with obj:', obj);
      console.log('D3 SVG selection:', d3svg);
      psgraph.pspicture.call(obj, d3svg);
    } else {
      console.log('SVG or div refs not available:', { svgRef: svgRef.current, divRef: divRef.current });
    }
  }, [props]);

  return (
    <div
      className="pspicture"
      style={{ width: width, height: height }}
      ref={divRef}
    >
      <svg width={size.width} height={size.height} ref={svgRef} />
      {props.env.sliders &&
        props.env.sliders.map((slider: any, index: number) => {
          return (
            <Slider
              key={index}
              slider={slider}
              env={props.env}
              svgRef={svgRef}
              plot={props.plot}
            />
          );
        })}
    </div>
  );
};
