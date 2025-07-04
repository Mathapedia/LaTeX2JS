# LaTeX2Vue

## installation

### using the nuxt template

You can get started very quickly using [https://github.com/pyramation/nuxt-latex2vue-template](our nuxt starter template):

```sh
vue init pyramation/nuxt-latex2vue-template
cd my-project
# install dependencies
npm install # Or yarn install
```

### from scratch

1. Install the library!

```sh
npm install latex2vue
```

2. Require `latex2vue`. If you are using nuxt, you should add a plugin in `~plugins/latex2js.js`:

```js
import Vue from 'vue';
import VueLaTeX2JS from '@latex2js/vue';
Vue.use(VueLaTeX2JS);
```

3. Add CSS and plugin in your `nuxt.config.js`:

```js
css: [
  'latex2js/latex2js.css',
],
...
plugins: [
  { src: '~plugins/latex2js.js', ssr: false },
],
```

4. Now you have a `latex` component! Just set the `content` property and have a go!

```html
<latex :content="someVariable" />
```
