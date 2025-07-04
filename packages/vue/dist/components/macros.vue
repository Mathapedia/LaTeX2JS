<template>
  <div id="latex-macros" style="display:none" />
</template>
<script>
import macroStr from '@latex2js/macros';
export default {
  mounted() {
    this.$el.innerHTML = macroStr;
  },
};
</script>
