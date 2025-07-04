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
const tex = String.raw`
\begin{center}
\begin{pspicture}(0,-3)(8,3)
...
\end{pspicture}
\end{center}
`;

class App extends Component {
  render() {
    return <LaTeX content={tex} />;
  }
}
```
