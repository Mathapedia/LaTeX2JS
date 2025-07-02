import type { NuxtConfig } from '@nuxt/types';

const config: NuxtConfig = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'nuxt-app',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  /*
  ** Add latex2js CSS and latex2vue JS
  */
  css: ['latex2js/latex2js.css'],
  plugins: [{ src: '~plugins/latex2vue.ts', ssr: false }],

  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** TypeScript support enabled by default in Nuxt 3+
    */
  },
};

export default config;
