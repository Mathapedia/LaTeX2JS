interface ComponentProps {
  lines?: string[];
  [key: string]: any;
}

export default function render(_that: ComponentProps): HTMLInputElement {
  return document.createElement('input');
}
