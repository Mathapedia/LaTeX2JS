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
    // Import debug utilities
    const startTime = Date.now();
    
    // Validate coordinates
    const x = this.x;
    const y = this.y;
    
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      console.warn('RPUT: Invalid coordinates detected', { x, y, text: this.text });
      return;
    }

    // Validate parent container
    if (!el || !el.appendChild) {
      console.warn('RPUT: Invalid parent container provided');
      return;
    }

    // Validate content
    if (!this.text || typeof this.text !== 'string') {
      console.warn('RPUT: Invalid text content', { text: this.text });
      return;
    }

    const div = document.createElement('div');
    
    // Set up element with improved styling for better measurement
    div.className = 'math';
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'nowrap'; // Prevent text wrapping during measurement
    div.style.top = `${y}px`;
    div.style.left = `${x}px`;
    div.style.pointerEvents = 'none'; // Prevent interference during positioning
    
    // Add data attributes for debugging
    div.setAttribute('data-rput-x', x.toString());
    div.setAttribute('data-rput-y', y.toString());
    div.setAttribute('data-rput-text', this.text);

    // Enhanced positioning function with better measurement
    const positionElement = () => {
      return new Promise<void>((resolve) => {
        // Use requestAnimationFrame to ensure DOM has been updated
        requestAnimationFrame(() => {
          try {
            // Get accurate bounding box
            const rect = div.getBoundingClientRect();
            
            // Validate measurements
            if (rect.width === 0 || rect.height === 0) {
              console.warn('RPUT: Element has zero dimensions, retrying...', { 
                text: this.text, 
                rect: { width: rect.width, height: rect.height } 
              });
              
              // Retry measurement after a short delay
              setTimeout(() => {
                const retryRect = div.getBoundingClientRect();
                const w = retryRect.width / 2;
                const h = retryRect.height / 2;
                
                // Apply centering with fallback for zero dimensions
                div.style.top = `${y - (h || 10)}px`;
                div.style.left = `${x - (w || 20)}px`;
                div.style.visibility = 'visible';
                div.style.pointerEvents = 'auto';
                resolve();
              }, 10);
              return;
            }

            // Calculate center offsets
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Apply precise centering
            div.style.top = `${y - centerY}px`;
            div.style.left = `${x - centerX}px`;
            div.style.visibility = 'visible';
            div.style.pointerEvents = 'auto';
            
            resolve();
          } catch (error) {
            console.error('RPUT: Error during positioning', error);
            // Fallback positioning
            div.style.top = `${y}px`;
            div.style.left = `${x}px`;
            div.style.visibility = 'visible';
            div.style.pointerEvents = 'auto';
            resolve();
          }
        });
      });
    };

    // Enhanced MathJax processing with better async handling
    const processContent = async () => {
      const mathJax = (window as any).MathJax;
      
      if (mathJax && mathJax.typesetPromise) {
        try {
          // Set content before MathJax processing
          div.innerHTML = this.text;
          
          // Process with MathJax
          await mathJax.typesetPromise([div]);
          
          // Wait for MathJax to complete rendering
          await new Promise(resolve => setTimeout(resolve, 0));
          
          // Position element after MathJax is complete
          await positionElement();
          
        } catch (error) {
          console.error('MathJax typesetting failed:', error);
          // Fallback to plain HTML
          div.innerHTML = this.text;
          await positionElement();
        }
      } else {
        // No MathJax available, use plain HTML
        div.innerHTML = this.text;
        await positionElement();
      }
    };

    // Ensure parent is ready before appending
    if (el.isConnected === false) {
      console.warn('RPUT: Parent container not connected to DOM');
    }
    
    // Append to DOM
    el.appendChild(div);
    
    // Process content asynchronously
    processContent().catch((error) => {
      console.error('RPUT: Failed to process content', error);
      // Emergency fallback
      div.style.visibility = 'visible';
      div.style.pointerEvents = 'auto';
    });
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
      }
    );

    svg.on(
      'mousemove',
      function (this: any, event: any) {
        var coords = [event.offsetX || 0, event.offsetY || 0];
        userEvent(coords);
      }
    );

    const plots = this.plot;
    function userEvent(coords: any): void {
      svg.selectAll('.userline').remove();
      svg.selectAll('.psplot').remove();
      var currentEnvironment: { [key: string]: any } = {};

      Object.entries(plots || {})
        .forEach(([k, plot]: [string, any]) => {
          if (k.match(/uservariable/)) {
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
              Object.assign(d.global, env);
              Object.assign(d, data.data);
              psgraph[k].call(d, svg);
            });
          }
        });
    }

    // Enhanced cleanup and RPUT processing
    psgraph.processRputElements.call(this, el);
  },

  processRputElements(el: any): void {
    // Validate container
    if (!el || typeof el.querySelectorAll !== 'function') {
      console.warn('RPUT: Invalid container for RPUT processing');
      return;
    }

    // Validate RPUT data
    if (!this.plot || !Array.isArray(this.plot.rput)) {
      console.warn('RPUT: No RPUT data to process');
      return;
    }

    // Enhanced cleanup with better error handling
    try {
      // Remove existing RPUT elements
      const existingElements = el.querySelectorAll('.math[data-rput-x]');
      let cleanupCount = 0;
      
      existingElements.forEach((element: HTMLElement) => {
        try {
          // Clean up any pending async operations
          element.style.visibility = 'hidden';
          element.remove();
          cleanupCount++;
        } catch (error) {
          console.warn('RPUT: Error removing existing element', error);
        }
      });

      if (cleanupCount > 0) {
        console.log(`RPUT: Cleaned up ${cleanupCount} existing elements`);
      }

      // Wait for DOM to settle after cleanup
      requestAnimationFrame(() => {
        psgraph.renderRputElements.call(this, el);
      });

    } catch (error) {
      console.error('RPUT: Error during cleanup', error);
      // Fallback to immediate rendering
      psgraph.renderRputElements.call(this, el);
    }
  },

  renderRputElements(el: any): void {
    if (!this.plot?.rput || this.plot.rput.length === 0) {
      return;
    }

    // Track rendering for debugging
    console.log(`RPUT: Rendering ${this.plot.rput.length} elements`);
    
    // Process RPUT elements with better error isolation
    const renderPromises: Promise<void>[] = [];
    
    this.plot.rput.forEach((rput: any, index: number) => {
      try {
        // Validate RPUT data
        if (!rput || !rput.data) {
          console.warn(`RPUT: Invalid RPUT data at index ${index}`, rput);
          return;
        }

        // Add global context
        rput.data.global = this.env;
        
        // Create a promise for this RPUT element
        const renderPromise = new Promise<void>((resolve) => {
          try {
            // Use setTimeout to prevent blocking the main thread
            setTimeout(() => {
              psgraph.rput.call(rput.data, el);
              resolve();
            }, index * 10); // Stagger rendering slightly
          } catch (error) {
            console.error(`RPUT: Error rendering element ${index}`, error);
            resolve();
          }
        });
        
        renderPromises.push(renderPromise);
        
      } catch (error) {
        console.error(`RPUT: Error processing element ${index}`, error);
      }
    });

    // Wait for all RPUT elements to be processed
    Promise.all(renderPromises)
      .then(() => {
        console.log('RPUT: All elements rendered successfully');
      })
      .catch((error) => {
        console.error('RPUT: Error in batch rendering', error);
      });
  }
};

export { arrow };
export default psgraph;
