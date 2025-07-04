export declare class SVGSelection {
    private elements;
    constructor(elements: Element | Element[] | NodeList);
    append(tagName: string): SVGSelection;
    attr(name: string, value: string | number): SVGSelection;
    style(name: string, value: string | number): SVGSelection;
    selectAll(selector: string): SVGSelection;
    remove(): SVGSelection;
    on(event: string, handler: (event: Event) => void): SVGSelection;
    node(): Element | null;
    text(content: string): SVGSelection;
}
export declare function select(selector: string | Element): SVGSelection;
