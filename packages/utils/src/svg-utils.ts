export class SVGSelection {
  private elements: Element[];

  constructor(elements: Element | Element[] | NodeList) {
    if (elements instanceof Element) {
      this.elements = [elements];
    } else if (elements instanceof NodeList) {
      this.elements = Array.from(elements).filter((node): node is Element => node.nodeType === Node.ELEMENT_NODE);
    } else {
      this.elements = Array.isArray(elements) ? elements : [];
    }
  }

  append(tagName: string): SVGSelection {
    const newElements: Element[] = [];
    this.elements.forEach(parent => {
      const elementName = tagName.startsWith('svg:') ? tagName.substring(4) : tagName;
      const element = document.createElementNS('http://www.w3.org/2000/svg', elementName);
      parent.appendChild(element);
      newElements.push(element);
    });
    return new SVGSelection(newElements);
  }

  attr(name: string, value: string | number): SVGSelection {
    this.elements.forEach(el => {
      el.setAttribute(name, String(value));
    });
    return this;
  }

  style(name: string, value: string | number): SVGSelection {
    this.elements.forEach(el => {
      if (el instanceof SVGElement || el instanceof HTMLElement) {
        (el.style as any)[name] = String(value);
      }
    });
    return this;
  }

  selectAll(selector: string): SVGSelection {
    const selected: Element[] = [];
    this.elements.forEach(parent => {
      const found = parent.querySelectorAll(selector);
      selected.push(...Array.from(found));
    });
    return new SVGSelection(selected);
  }

  remove(): SVGSelection {
    this.elements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    return this;
  }

  on(event: string, handler: (event: Event) => void): SVGSelection {
    this.elements.forEach(el => {
      el.addEventListener(event, handler);
    });
    return this;
  }

  node(): Element | null {
    return this.elements[0] || null;
  }

  text(content: string): SVGSelection {
    this.elements.forEach(el => {
      if (el instanceof SVGTextElement || el instanceof HTMLElement) {
        el.textContent = content;
      }
    });
    return this;
  }
}

export function select(selector: string | Element): SVGSelection {
  if (typeof selector === 'string') {
    const element = document.querySelector(selector);
    return new SVGSelection(element ? [element] : []);
  }
  return new SVGSelection(selector);
}
