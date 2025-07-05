mathjaxjs-react


## installation

Install the library

```sh
yarn add mathjaxjs-react
```

```js
import { MathJaxProvider } from 'mathjaxjs-react';

const tex = String.raw`
Here is some great equation:

$$x = \frac{{-b \pm \sqrt{b^2-4ac}}}{{2a}}$$
`;

function App() {
  return (
    <MathJaxProvider>
      {tex}
    </MathJaxProvider>
  );
}