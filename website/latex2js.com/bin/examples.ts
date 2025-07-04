import { sync as glob } from 'glob';
import * as fs from 'fs';

const t = [];
glob(__dirname + '/../examples/tex/*.tex').forEach(tex => {
  const text = fs.readFileSync(tex).toString();

  t.push('<br>');
  t.push('<br>');
  t.push(text);
  t.push('<br>');
  t.push('source:');
  t.push('<br>');
  t.push('\\begin{verbatim}');
  t.push(text);
  t.push('\\end{verbatim}');
  t.push('<br>');
  t.push('<hr>');
});

const HEADER = `
<!DOCTYPE html>
<!-- built by Dan Lynch in Berkeley and San Francisco -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=5.0">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">

  <title>LaTeX2JS Examples</title>
  <meta property="og:title" content="LaTeX2JS Examples">
  <meta name="title" content="LaTeX2JS Examples">

  <meta name="keywords" content="Interactive Mathematics Diagrams and Equations, Dan Lynch, UC Berkeley, LaTeX, PSTricks, JavaScript">
  <meta name="description" http-equiv="description" content="Build interactive math equations and diagrams online using LaTeX and PSTricks">
  <meta property="og:description" content="Build interactive math equations and diagrams online using LaTeX and PSTricks">
  <meta property="og:type" content="article">

  <meta property="og:image" content="https://latex2js.com/assets/images/share.jpg" />
  <meta property="og:image:secure_url" content="https://latex2js.com/assets/images/share.jpg" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1024" />
  <meta property="og:image:height" content="768" />

  <meta property="og:site_name" content="LaTeX2JS">

  <link href="https://fonts.googleapis.com/css?family=Arbutus+Slab" rel="stylesheet" type="text/css">
  <link rel="stylesheet" href="/assets/css/latex2js.css">
  <link rel="stylesheet" href="/assets/css/website.css">
  <script src="/assets/js/latex2html5.bundle.js"></script>

</head>
<body>

<a href="https://github.com/pyramation/LaTeX2JS" target="latexisawesome"><img style="position: fixed; z-index: 10000000; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png" alt="Fork me on GitHub"></a>

<a href="/">Home</a>
<a href="/examples/index.html">Examples</a>
<a href="/installation/index.html">Installation</a>
<a href="https://github.com/pyramation/LaTeX2JS/tree/master/examples">Github Examples</a>

<div class="centered">
  <h1>LaTeX2JS Examples</h1>
  <p> Be sure to checkout the example apps on Github <a href="https://github.com/pyramation/LaTeX2JS/tree/master/examples">here</a>! </p>
</div>

<script type="text/latex">
`;

const FOOTER = `
</script>

<div class="latex-container">
    <a href="http://www.mathjax.org" target="mathjax">
      <img title="Powered by MathJax"
        src="https://cdn.mathjax.org/mathjax/badge/badge.gif"
        border="0" alt="Powered by MathJax" />
    </a>
</div>

<div class="latex-container">
    <p><a href="https://www.linkedin.com/in/danielpatricklynch/" target="danlynch">Dan Lynch</a> © <a href="https://latex2js.com" target="latex2js">LaTeX2JS</a> 2020 </p>
</div>

<script>
LaTeX2HTML5.init();
</script>

</body>
</html>
`;

const content = HEADER + t.join('\n') + FOOTER;

fs.writeFileSync(__dirname + '/../examples/index.html', content);

glob(__dirname + '/../examples/community/*.tex').forEach(tex => {
  const text = fs.readFileSync(tex).toString();
  const content = HEADER + text + FOOTER;
  fs.writeFileSync(tex.replace(/\.tex$/, '.html'), content);
});
