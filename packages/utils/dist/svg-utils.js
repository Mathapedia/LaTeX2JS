"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVGSelection = void 0;
exports.select = select;
class SVGSelection {
    constructor(elements) {
        if (elements instanceof Element) {
            this.elements = [elements];
        }
        else if (elements instanceof NodeList) {
            this.elements = Array.from(elements).filter((node) => node.nodeType === Node.ELEMENT_NODE);
        }
        else {
            this.elements = Array.isArray(elements) ? elements : [];
        }
    }
    append(tagName) {
        const newElements = [];
        this.elements.forEach(parent => {
            const elementName = tagName.startsWith('svg:') ? tagName.substring(4) : tagName;
            const element = document.createElementNS('http://www.w3.org/2000/svg', elementName);
            parent.appendChild(element);
            newElements.push(element);
        });
        return new SVGSelection(newElements);
    }
    attr(name, value) {
        this.elements.forEach(el => {
            el.setAttribute(name, String(value));
        });
        return this;
    }
    style(name, value) {
        this.elements.forEach(el => {
            if (el instanceof SVGElement || el instanceof HTMLElement) {
                el.style[name] = String(value);
            }
        });
        return this;
    }
    selectAll(selector) {
        const selected = [];
        this.elements.forEach(parent => {
            const found = parent.querySelectorAll(selector);
            selected.push(...Array.from(found));
        });
        return new SVGSelection(selected);
    }
    remove() {
        this.elements.forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        return this;
    }
    on(event, handler) {
        this.elements.forEach(el => {
            el.addEventListener(event, handler);
        });
        return this;
    }
    node() {
        return this.elements[0] || null;
    }
    text(content) {
        this.elements.forEach(el => {
            if (el instanceof SVGTextElement || el instanceof HTMLElement) {
                el.textContent = content;
            }
        });
        return this;
    }
}
exports.SVGSelection = SVGSelection;
function select(selector) {
    if (typeof selector === 'string') {
        const element = document.querySelector(selector);
        return new SVGSelection(element ? [element] : []);
    }
    return new SVGSelection(selector);
}
