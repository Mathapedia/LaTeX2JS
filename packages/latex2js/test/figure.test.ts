import LaTeX2JS from '../src';

const render = (tex: string): string => {
  const parsed: any = new LaTeX2JS().parse(tex);
  return parsed.map((segment: any) => (segment.lines || []).join('\n')).join('\n');
};

describe('raster figure wrappers', () => {
  it.each([
    ['\\img{figure.png}', '<div class="latex2js-figure"><img src="figure.png"></div>'],
    [
      '\\youtube{video-id}',
      '<div class="latex2js-figure"><iframe width="560" height="315" src="https://www.youtube.com/embed/video-id"',
    ],
  ])('uses the figure class for %s', (tex, expected) => {
    expect(render(tex)).toContain(expected);
  });
});
