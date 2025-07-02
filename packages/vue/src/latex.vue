<template>
  <div class="latex-container">
    <macros v-if="!usemacros" />
    <component
      v-for="(item, id) in items"
      :is="item.type"
      :env="item.env"
      :lines="item.lines"
      :plot="item.plot"
      :settings="item.settings"
      :key="id"
      >
    </component>
  </div>
</template>

<script>
import LaTeX2JS from 'latex2js';
import { getMathJax, loadMathJax } from '@latex2js/mathjax';
import pspicture from './components/pspicture.vue';
import nicebox from './components/nicebox.vue';
import enumerate from './components/enumerate.vue';
import verbatim from './components/verbatim.vue';
import slider from './components/slider.vue';
import math from './components/math.vue';
import macros from './components/macros.vue';

export default {
  name: 'latex',
  components: {
    pspicture,
    nicebox,
    enumerate,
    verbatim,
    slider,
    math,
    macros,
  },
  beforeMount() {
    if (document.getElementById('latex-macros')) {
      this.usemacros = true;
    } else {
      this.usemacros = false;
    }

    if (getMathJax()) {
	  this.loaded = true;
      return;
    }
    loadMathJax(() => {
      this.loaded = true;
    });
  },
  mounted(){
  	let MathJax = getMathJax();
	if (MathJax != undefined)
	MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  },
  data() {
    return {
      usemacros: false,
      loaded: false,
    };
  },
  computed: {
    items() {
      const latex = new LaTeX2JS();
      const parsed = latex.parse(this.$attrs.content);
      return this.loaded ? parsed : [];
    },
  },
};
</script>
