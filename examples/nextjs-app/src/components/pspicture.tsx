import React, { useRef, useEffect } from 'react';
import { select } from '@latex2js/utils';
import Slider from './slider';
import { Y } from '@latex2js/utils';

function arrow(x1: number, y1: number, x2: number, y2: number) {
  var t = Math.PI / 6;
  var d = 8;
  var dx = x2 - x1,
    dy = y2 - y1;
  var l = Math.sqrt(dx * dx + dy * dy);

  var cost = Math.cos(t);
  var sint = Math.sin(t);
  var dl = d / l;

  var x = x2 - (dx * cost - dy * sint) * dl;
  var y = y2 - (dy * cost + dx * sint) * dl;

  var context = [];
  context.push('M');
  context.push(x2);
  context.push(y2);
  context.push('L');
  context.push(x);
  context.push(y);

  cost = Math.cos(-t);
  sint = Math.sin(-t);

  x = x2 - (dx * cost - dy * sint) * dl;
  y = y2 - (dy * cost + dx * sint) * dl;

  context.push(x);
  context.push(y);

  context.push('Z');
  return context.join(' ');
}

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

  psframe(svg: any): void {
    svg
      .append('svg:line')
      .attr('x1', this.x1)
      .attr('y1', this.y1)
      .attr('x2', this.x2)
      .attr('y2', this.y1)
      .style('stroke-width', 2)
      .style('stroke', 'rgb(0,0,0)')
      .style('stroke-opacity', 1);

    svg
      .append('svg:line')
      .attr('x1', this.x2)
      .attr('y1', this.y1)
      .attr('x2', this.x2)
      .attr('y2', this.y2)
      .style('stroke-width', 2)
      .style('stroke', 'rgb(0,0,0)')
      .style('stroke-opacity', 1);

    svg
      .append('svg:line')
      .attr('x1', this.x2)
      .attr('y1', this.y2)
      .attr('x2', this.x1)
      .attr('y2', this.y2)
      .style('stroke-width', 2)
      .style('stroke', 'rgb(0,0,0)')
      .style('stroke-opacity', 1);

    svg
      .append('svg:line')
      .attr('x1', this.x1)
      .attr('y1', this.y2)
      .attr('x2', this.x1)
      .attr('y2', this.y1)
      .style('stroke-width', 2)
      .style('stroke', 'rgb(0,0,0)')
      .style('stroke-opacity', 1);
  },

  pscircle: function (svg: any) {
    svg
      .append('svg:circle')
      .attr('cx', this.cx)
      .attr('cy', this.cy)
      .attr('r', this.r)
      .style('stroke', 'black')
      .style('fill', 'none')
      .style('stroke-width', 2)
      .style('stroke-opacity', 1);
  },

  psplot(svg: any): void {
    var context = [];
    context.push('M');
    if (this.fillstyle === 'solid') {
      context.push(this.data[0]);
      context.push(Y.call(this.global, 0));
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
      context.push(Y.call(this.global, 0));
      context.push('Z');
    }

    svg
      .append('svg:path')
      .attr('d', context.join(' '))
      .attr('class', 'psplot')
      .style('stroke-width', this.linewidth)
      .style('stroke-opacity', 1)
      .style('fill', this.fillstyle === 'none' ? 'none' : this.fillcolor)
      .style('stroke', this.linecolor);
  },

  pspolygon(svg: any): void {
    var context = [];
    context.push('M');
    context.push(this.data[0]);
    context.push(this.data[1]);
    context.push('L');

    this.data.forEach((data: any) => {
      context.push(data);
    });
    context.push('Z');

    svg
      .append('svg:path')
      .attr('d', context.join(' '))
      .style('stroke-width', this.linewidth)
      .style('stroke-opacity', 1)
      .style('fill', this.fillstyle === 'none' ? 'none' : this.fillcolor)
      .style('stroke', 'black');
  },

  psarc(svg: any): void {
    var context = [];
    context.push('M');
    context.push(this.cx);
    context.push(this.cy);
    context.push('L');
    context.push(this.A.x);
    context.push(this.A.y);

    context.push('A');

    context.push(this.A.x);
    context.push(this.A.y);

    context.push(0);
    context.push(0);
    context.push(0);

    context.push(this.B.x);
    context.push(this.B.y);

    svg
      .append('svg:path')
      .attr('d', context.join(' '))
      .style('stroke-width', 2)
      .style('stroke-opacity', 1)
      .style('fill', 'blue')
      .style('stroke', 'black');
  },

  psaxes(svg: any): void {
    var xaxis = [this.bottomLeft[0], this.topRight[0]];
    var yaxis = [this.bottomLeft[1], this.topRight[1]];

    var origin = this.origin;

    function line(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', 2)
        .style('stroke', 'rgb(0,0,0)')
        .style('stroke-opacity', 1);
    }

    var xticks = () => {
      for (var x = xaxis[0]; x <= xaxis[1]; x += this.dx) {
        line(x, origin[1] - 5, x, origin[1] + 5);
      }
    };

    var yticks = () => {
      for (var y = yaxis[0]; y <= yaxis[1]; y += this.dy) {
        line(origin[0] - 5, y, origin[0] + 5, y);
      }
    };

    line(xaxis[0], origin[1], xaxis[1], origin[1]);
    line(origin[0], yaxis[0], origin[0], yaxis[1]);

    if (this.ticks.match(/all/)) {
      xticks();
      yticks();
    } else if (this.ticks.match(/x/)) {
      xticks();
    } else if (this.ticks.match(/y/)) {
      yticks();
    }

    if (this.arrows[0]) {
      svg
        .append('path')
        .attr('d', arrow(xaxis[1], origin[1], xaxis[0], origin[1]))
        .style('fill', 'black')
        .style('stroke', 'black');

      svg
        .append('path')
        .attr('d', arrow(origin[0], yaxis[1], origin[0], yaxis[0]))
        .style('fill', 'black')
        .style('stroke', 'black');
    }

    if (this.arrows[1]) {
      svg
        .append('path')
        .attr('d', arrow(xaxis[0], origin[1], xaxis[1], origin[1]))
        .style('fill', 'black')
        .style('stroke', 'black');

      svg
        .append('path')
        .attr('d', arrow(origin[0], yaxis[0], origin[0], yaxis[1]))
        .style('fill', 'black')
        .style('stroke', 'black');
    }
  },

  psline(svg: any): void {
    var linewidth = this.linewidth,
      linecolor = this.linecolor;

    function solid(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-opacity', 1);
    }

    function dashed(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-dasharray', '9,5')
        .style('stroke-opacity', 1);
    }

    function dotted(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-dasharray', '9,5')
        .style('stroke-opacity', 1);
    }

    if (this.linestyle.match(/dotted/)) {
      dotted(this.x1, this.y1, this.x2, this.y2);
    } else if (this.linestyle.match(/dashed/)) {
      dashed(this.x1, this.y1, this.x2, this.y2);
    } else {
      solid(this.x1, this.y1, this.x2, this.y2);
    }

    if (this.dots[0]) {
      svg
        .append('svg:circle')
        .attr('cx', this.x1)
        .attr('cy', this.y1)
        .attr('r', 3)
        .style('stroke', this.linecolor)
        .style('fill', this.linecolor)
        .style('stroke-width', 1)
        .style('stroke-opacity', 1);
    }

    if (this.dots[1]) {
      svg
        .append('svg:circle')
        .attr('cx', this.x2)
        .attr('cy', this.y2)
        .attr('r', 3)
        .style('stroke', this.linecolor)
        .style('fill', this.linecolor)
        .style('stroke-width', 1)
        .style('stroke-opacity', 1);
    }

    var x1 = this.x1,
      y1 = this.y1,
      x2 = this.x2,
      y2 = this.y2;

    if (this.arrows[0]) {
      svg
        .append('path')
        .attr('d', arrow(x2, y2, x1, y1))
        .style('fill', this.linecolor)
        .style('stroke', this.linecolor);
    }

    if (this.arrows[1]) {
      svg
        .append('path')
        .attr('d', arrow(x1, y1, x2, y2))
        .style('fill', this.linecolor)
        .style('stroke', this.linecolor);
    }
  },

  userline(svg: any): void {
    var linewidth = this.linewidth,
      linecolor = this.linecolor;

    function solid(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('class', 'userline')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-opacity', 1);
    }

    function dashed(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .attr('class', 'userline')
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-dasharray', '9,5')
        .style('stroke-opacity', 1);
    }

    function dotted(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .attr('class', 'userline')
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-dasharray', '9,5')
        .style('stroke-opacity', 1);
    }

    if (this.linestyle.match(/dotted/)) {
      dotted(this.x1, this.y1, this.x2, this.y2);
    } else if (this.linestyle.match(/dashed/)) {
      dashed(this.x1, this.y1, this.x2, this.y2);
    } else {
      solid(this.x1, this.y1, this.x2, this.y2);
    }

    if (this.dots[0]) {
      svg
        .append('svg:circle')
        .attr('cx', this.x1)
        .attr('cy', this.y1)
        .attr('r', 3)
        .attr('class', 'userline')
        .style('stroke', this.linecolor)
        .style('fill', this.linecolor)
        .style('stroke-width', 1)
        .style('stroke-opacity', 1);
    }

    if (this.dots[1]) {
      svg
        .append('svg:circle')
        .attr('cx', this.x2)
        .attr('cy', this.y2)
        .attr('r', 3)
        .attr('class', 'userline')
        .style('stroke', this.linecolor)
        .style('fill', this.linecolor)
        .style('stroke-width', 1)
        .style('stroke-opacity', 1);
    }

    var x1 = this.x1,
      y1 = this.y1,
      x2 = this.x2,
      y2 = this.y2;

    if (this.arrows[0]) {
      svg
        .append('path')
        .attr('d', arrow(x2, y2, x1, y1))
        .attr('class', 'userline')
        .style('fill', this.linecolor)
        .style('stroke', this.linecolor);
    }

    if (this.arrows[1]) {
      svg
        .append('path')
        .attr('d', arrow(x1, y1, x2, y2))
        .attr('class', 'userline')
        .style('fill', this.linecolor)
        .style('stroke', this.linecolor);
    }
  },

  rput(el: any): void {
    const div = document.createElement('div');

    const x = this.x;
    const y = this.y;

    div.innerHTML = this.text;
    div.className = 'math';
    div.style.visibility = 'hidden';
    div.style.position = 'absolute';
    div.style.top = `${y}px`;
    div.style.left = `${x}px`;

    el.appendChild(div);

    const done = () => {
      const rct = div.getBoundingClientRect();
      const w = rct.width / 2;
      const h = rct.height / 2;
      div.style.visibility = 'visible';
      div.style.top = `${y - h}px`;
      div.style.left = `${x - w}px`;
    };

    const mathJax = (window as any).MathJax;
    if (mathJax && mathJax.typesetPromise) {
      mathJax.typesetPromise([div]).then(done).catch((err: any) => {
        console.error('MathJax typesetting failed:', err);
        done();
      });
    } else {
      done();
    }
  },

  pspicture(svg: any): void {
    var env = this.env;
    var el = this.$el;

    Object.keys(this.plot).forEach((key) => {
      const plot = this.plot[key];
      if (key.match(/rput/)) return;
      if (psgraph.hasOwnProperty(key)) {
        plot.forEach((data: any) => {
          data.data.global = env;
          psgraph[key].call(data.data, svg);
        });
      }
    });

    svg.on(
      'touchmove',
      function (this: any, event: any) {
        event.preventDefault();
        var touchcoords = event.touches ? event.touches[0] : [0, 0];
        userEvent(touchcoords);
      },
      false
    );

    svg.on(
      'mousemove',
      function (this: any, event: any) {
        var coords = [event.offsetX || 0, event.offsetY || 0];
        userEvent(coords);
      },
      false
    );

    const plots = this.plot;
    function userEvent(coords: any): void {
      console.log('=== USERLINE DEBUG: userEvent called ===');
      console.log('Mouse coordinates:', coords);
      console.log('Available plots:', Object.keys(plots || {}));
      
      svg.selectAll('.userline').remove();
      svg.selectAll('.psplot').remove();
      var currentEnvironment: { [key: string]: any } = {};
      
      Object.entries(plots || {})
      .forEach(([k, plot]: [string, any]) => {
        if (k.match(/uservariable/)) {
          console.log('Processing uservariable:', k, plot);
          plot.forEach((data: any) => {
            data.env.userx = coords[0];
            data.env.usery = coords[1];
            var dd = data.fn.call(data.env, data.match);
            currentEnvironment[data.data.name] = dd.value;
          });
        }
      });
      
      Object.entries(plots || {})
      .forEach(([k, plot]: [string, any]) => {
        if (k.match(/psplot/)) {
          console.log('Processing psplot:', k, plot);
          plot.forEach((data: any) => {
            Object.entries(currentEnvironment || {})
            .forEach(([name, variable]: [string, any]) => {
              data.env.variables[name] = variable;
            });
            var d = data.fn.call(data.env, data.match);
            d.global = {};
            Object.assign(d.global, env);
            psgraph[k].call(d, svg);            
          });
        }
        if (k.match(/userline/)) {
          console.log('=== Processing userline:', k);
          console.log('Userline plot data:', plot);
          plot.forEach((data: any, index: number) => {
            console.log(`--- Userline ${index} ---`);
            console.log('Data object:', data);
            console.log('Data.data:', data.data);
            console.log('Expressions - xExp:', data.data.xExp, 'yExp:', data.data.yExp, 'xExp2:', data.data.xExp2, 'yExp2:', data.data.yExp2);
            
            try {
              var d = data.fn.call(data.env, data.match);
              console.log('Function call result d:', d);
              
              data.env.x2 = coords[0];
              data.env.y2 = coords[1];
              data.data.x2 = data.env.x2;
              data.data.y2 = data.env.y2;
              
              if (data.data.xExp2) {
                console.log('Evaluating xExp2 and xExp');
                data.data.x2 = d.userx2(coords);
                data.data.x1 = d.userx(coords);
                console.log('xExp2 result - x1:', data.data.x1, 'x2:', data.data.x2);
              } else if (data.data.xExp) {
                console.log('Evaluating xExp only');
                data.data.x2 = d.userx(coords);
                console.log('xExp result - x2:', data.data.x2);
              }
              
              if (data.data.yExp2) {
                console.log('Evaluating yExp2 and yExp');
                data.data.y2 = d.usery2(coords);
                data.data.y1 = d.usery(coords);
                console.log('yExp2 result - y1:', data.data.y1, 'y2:', data.data.y2);
              } else if (data.data.yExp) {
                console.log('Evaluating yExp only');
                data.data.y2 = d.usery(coords);
                console.log('yExp result - y2:', data.data.y2);
              }
              
              d.global = {};
              Object.assign(d.global, env);
              Object.assign(d, data.data);
              
              console.log('Final userline data before rendering:', {
                x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2,
                linecolor: d.linecolor, linestyle: d.linestyle,
                arrows: d.arrows, dots: d.dots
              });
              
              psgraph[k].call(d, svg);
              console.log('Userline rendered successfully');
            } catch (error) {
              console.error('ERROR rendering userline:', error);
              console.error('Error details:', {
                data: data,
                coords: coords,
                expressions: {
                  xExp: data.data.xExp,
                  yExp: data.data.yExp,
                  xExp2: data.data.xExp2,
                  yExp2: data.data.yExp2
                }
              });
            }
          });
        }
      });
    }

    this.plot.rput.forEach((rput: any) => {
      psgraph.rput.call(rput.data, el);
    });
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
      const d3svg = select(svgRef.current);
      const obj = { ...props };
      obj.$el = divRef.current;
      console.log('Calling psgraph.pspicture with obj:', obj);
      console.log('D3 SVG selection:', d3svg);
      psgraph.pspicture.call(obj, d3svg);
    } else {
      console.log('SVG or div refs not available:', { svgRef: svgRef.current, divRef: divRef.current });
    }
  }, [props]);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    console.log('React mousemove event triggered');
    const rect = event.currentTarget.getBoundingClientRect();
    const coords = [
      event.clientX - rect.left,
      event.clientY - rect.top
    ];
    console.log('Mouse coordinates from React event:', coords);
    
    if (svgRef.current) {
      const d3svg = select(svgRef.current);
      const obj = { ...props };
      
      if (obj.plot) {
        console.log('Calling userEvent with coordinates:', coords);
        userEventHandler(coords, d3svg, obj);
      }
    }
  };

  const handleTouchMove = (event: React.TouchEvent<SVGSVGElement>) => {
    event.preventDefault();
    console.log('React touchmove event triggered');
    const rect = event.currentTarget.getBoundingClientRect();
    const touch = event.touches[0];
    const coords = [
      touch.clientX - rect.left,
      touch.clientY - rect.top
    ];
    console.log('Touch coordinates from React event:', coords);
    
    if (svgRef.current) {
      const d3svg = select(svgRef.current);
      const obj = { ...props };
      
      if (obj.plot) {
        console.log('Calling userEvent with touch coordinates:', coords);
        userEventHandler(coords, d3svg, obj);
      }
    }
  };

  const userEventHandler = (coords: number[], svg: any, plotObj: any) => {
    console.log('=== USERLINE DEBUG: userEventHandler called ===');
    console.log('Mouse coordinates:', coords);
    console.log('Available plots:', Object.keys(plotObj.plot || {}));
    
    svg.selectAll('.userline').remove();
    svg.selectAll('.psplot').remove();
    var currentEnvironment: { [key: string]: any } = {};
    
    const plots = plotObj.plot;
    const env = plotObj.env || {};
    
    Object.entries(plots || {})
    .forEach(([k, plot]: [string, any]) => {
      if (k.match(/uservariable/)) {
        console.log('Processing uservariable:', k, plot);
        plot.forEach((data: any) => {
          data.env.userx = coords[0];
          data.env.usery = coords[1];
          var dd = data.fn.call(data.env, data.match);
          currentEnvironment[data.data.name] = dd.value;
        });
      }
    });
    
    Object.entries(plots || {})
    .forEach(([k, plot]: [string, any]) => {
      if (k.match(/psplot/)) {
        console.log('Processing psplot:', k, plot);
        plot.forEach((data: any) => {
          Object.entries(currentEnvironment || {})
          .forEach(([name, variable]: [string, any]) => {
            data.env.variables[name] = variable;
          });
          var d = data.fn.call(data.env, data.match);
          d.global = {};
          Object.assign(d.global, env);
          psgraph[k].call(d, svg);            
        });
      }
      if (k.match(/userline/)) {
        console.log('=== Processing userline:', k);
        console.log('Userline plot data:', plot);
        plot.forEach((data: any, index: number) => {
          console.log(`--- Userline ${index} ---`);
          console.log('Data object:', data);
          console.log('Data.data:', data.data);
          console.log('Expressions - xExp:', data.data.xExp, 'yExp:', data.data.yExp, 'xExp2:', data.data.xExp2, 'yExp2:', data.data.yExp2);
          
          try {
            var d = data.fn.call(data.env, data.match);
            console.log('Function call result d:', d);
            
            data.env.x2 = coords[0];
            data.env.y2 = coords[1];
            data.data.x2 = data.env.x2;
            data.data.y2 = data.env.y2;
            
            if (data.data.xExp2) {
              console.log('Evaluating xExp2 and xExp');
              data.data.x2 = d.userx2(coords);
              data.data.x1 = d.userx(coords);
              console.log('xExp2 result - x1:', data.data.x1, 'x2:', data.data.x2);
            } else if (data.data.xExp) {
              console.log('Evaluating xExp only');
              data.data.x2 = d.userx(coords);
              console.log('xExp result - x2:', data.data.x2);
            }
            
            if (data.data.yExp2) {
              console.log('Evaluating yExp2 and yExp');
              data.data.y2 = d.usery2(coords);
              data.data.y1 = d.usery(coords);
              console.log('yExp2 result - y1:', data.data.y1, 'y2:', data.data.y2);
            } else if (data.data.yExp) {
              console.log('Evaluating yExp only');
              data.data.y2 = d.usery(coords);
              console.log('yExp result - y2:', data.data.y2);
            }
            
            d.global = {};
            Object.assign(d.global, env);
            Object.assign(d, data.data);
            
            console.log('Final userline data before rendering:', {
              x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2,
              linecolor: d.linecolor, linestyle: d.linestyle,
              arrows: d.arrows, dots: d.dots
            });
            
            psgraph[k].call(d, svg);
            console.log('Userline rendered successfully');
          } catch (error) {
            console.error('ERROR rendering userline:', error);
            console.error('Error details:', {
              data: data,
              coords: coords,
              expressions: {
                xExp: data.data.xExp,
                yExp: data.data.yExp,
                xExp2: data.data.xExp2,
                yExp2: data.data.yExp2
              }
            });
          }
        });
      }
    });
  };

  return (
    <div
      className="pspicture"
      style={{ width: width, height: height }}
      ref={divRef}
    >
      <svg 
        width={size.width} 
        height={size.height} 
        ref={svgRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{ cursor: 'crosshair' }}
      />
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
