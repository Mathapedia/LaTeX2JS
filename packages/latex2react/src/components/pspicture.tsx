import { psgraph } from 'latex2js-pstricks';
import * as d3 from 'd3';
import { useRef, useEffect } from 'react';
import Slider from './slider';

interface PspictureProps {
  env: {
    sliders?: any[];
  };
  plot: any;
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
      const d3svg = d3.select(svgRef.current);
      const obj = { ...props };
      obj.$el = divRef.current;
      psgraph.pspicture.call(obj, d3svg);
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
