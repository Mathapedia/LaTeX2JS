# LaTeX2React

## installation

1. Install the library!

```sh
yarn add @latex2js/react
```

2. import the `latex2js` CSS file, and the `LaTeX` React component

```js
import 'latex2js/latex2js.css';
import { LaTeX } from '@latex2js/react';
```

3. Load your {\tt TeX} into the {\tt content} property. Enjoy!

```js
const diagramAndTex = String.raw`

Here is some great equation:

$$x = \frac{{-b \pm \sqrt{b^2-4ac}}}{{2a}}$$

And now for a great diagram:

\begin{pspicture}(0,-3)(8,3)
\rput(0,0){$x(t)$}
\rput(4,1.5){$f(t)$}
\rput(4,-1.5){$g(t)$}
\rput(8.2,0){$y(t)$}
\rput(1.5,-2){$h(t)$}
\psframe(1,-2.5)(7,2.5)
\psframe(3,1)(5,2)
\psframe(3,-1)(5,-2)
\rput(4,0){$X_k = \frac{1}{p} \sum \limits_{n=\langle p\rangle}x(n)e^{-ik\omega_0n}$}
\psline{->}(0.5,0)(1.5,0)
\psline{->}(1.5,1.5)(3,1.5)
\psline{->}(1.5,-1.5)(3,-1.5)
\psline{->}(6.5,1.5)(6.5,0.25)
\psline{->}(6.5,-1.5)(6.5,-0.25)
\psline{->}(6.75,0)(7.75,0)
\psline(1.5,-1.5)(1.5,1.5)
\psline(5,1.5)(6.5,1.5)
\psline(5,-1.5)(6.5,-1.5)
\psline(6,-1.5)(6.5,-1.5)
\pscircle(6.5,0){0.25}
\psline(6.25,0)(6.75,0)
\psline(6.5,0.5)(6.5,-0.5)
\end{pspicture}
`;

class App extends Component {
  render() {
    return <LaTeX content={diagram} />;
  }
}
```
