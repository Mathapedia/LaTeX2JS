import VueLaTeX2JS from '@latex2js/vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueLaTeX2JS);
});
