import React, { useRef, useEffect } from 'react';
import { select } from '@latex2js/utils';
import { psgraph } from '@latex2js/pstricks';
import Slider from './slider';

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
    if (svgRef.current && divRef.current) {
      const d3svg = select(svgRef.current);
      const obj = { ...props };
      obj.$el = divRef.current;
      psgraph.pspicture.call(obj, d3svg);
    }
  }, [props]);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const coords = [event.nativeEvent.offsetX || 0, event.nativeEvent.offsetY || 0];
    userEventHandler(coords);
  };

  const handleTouchMove = (event: React.TouchEvent<SVGSVGElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const coords = [touch.clientX - rect.left, touch.clientY - rect.top];
      userEventHandler(coords);
    }
  };

  const userEventHandler = (coords: number[]) => {
    if (!svgRef.current) return;
    
    const d3svg = select(svgRef.current);
    d3svg.selectAll('.userline').remove();
    d3svg.selectAll('.psplot').remove();
    
    var currentEnvironment: { [key: string]: any } = {};
    const plots = props.plot;
    
    Object.entries(plots || {}).forEach(([k, plot]: [string, any]) => {
      if (k.match(/uservariable/)) {
        plot.forEach((data: any) => {
          data.env.userx = coords[0];
          data.env.usery = coords[1];
          var dd = data.fn.call(data.env, data.match);
          currentEnvironment[data.data.name] = dd.value;
        });
      }
    });
    
    Object.entries(plots || {}).forEach(([k, plot]: [string, any]) => {
      if (k.match(/psplot/)) {
        plot.forEach((data: any) => {
          Object.entries(currentEnvironment || {}).forEach(([name, variable]: [string, any]) => {
            data.env.variables[name] = variable;
          });
          var d = data.fn.call(data.env, data.match);
          d.global = {};
          Object.assign(d.global, props.env);
          psgraph[k].call(d, d3svg);            
        });
      }
      if (k.match(/userline/)) {
        plot.forEach((data: any) => {
          var d = data.fn.call(data.env, data.match);
          data.env.x2 = coords[0];
          data.env.y2 = coords[1];
          data.data.x2 = data.env.x2;
          data.data.y2 = data.env.y2;
          
          if (data.data.xExp2) {
            data.data.x2 = d.userx2(coords);
            data.data.x1 = d.userx(coords);
          } else if (data.data.xExp) {
            data.data.x2 = d.userx(coords);
          }
          
          if (data.data.yExp2) {
            data.data.y2 = d.usery2(coords);
            data.data.y1 = d.usery(coords);
          } else if (data.data.yExp) {
            data.data.y2 = d.usery(coords);
          }
          
          d.global = {};
          Object.assign(d.global, props.env);
          Object.assign(d, data.data);
          psgraph[k].call(d, d3svg);            
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
