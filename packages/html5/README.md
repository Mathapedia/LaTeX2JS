# LaTeX2HTML5

```sh
yarn add latex2html5
```

## installation

This is for those who just want to make a simple HTML page with `LaTeX2JS`. The object provided is called `LaTeX2HTML5`:

1. Download the JS and CSS files! You can go get the JS [https://github.com/pyramation/LaTeX2JS/blob/master/libs/latex2html5/latex2html5.bundle.js](here) and CSS here [https://github.com/pyramation/LaTeX2JS/blob/master/core/latex2js/latex2js.css](here).

```html
<html>
  <head>
    <link rel="stylesheet" href="/path/to/your/css/latex2js.css">
    <script src="/path/to/your/js/latex2html5.bundle.js"></script>
  </head>
```

2. Then, write your \LaTeX inside of a script tag with _type_ set to `text/latex`:

```html
  <body>
    <script type="text/latex">
    you can write any \LaTeX here!
    </script>

    <script type="text/latex">
    some more ...
    </script>
```

3. Lastly, towards the end of your HTML page, call the `init` method

```html
    <script>
    LaTeX2HTML5.init();
    </script>
  </body>
</html>
```
