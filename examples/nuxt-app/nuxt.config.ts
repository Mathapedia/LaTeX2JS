export default defineNuxtConfig({
  devtools: { enabled: true },
  typescript: {
    typeCheck: true
  },
  css: [],
  modules: [],
  build: {
    transpile: ['latex2vue']
  }
})
