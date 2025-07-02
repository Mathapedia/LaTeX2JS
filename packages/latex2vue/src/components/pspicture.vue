<template>
  <div :style="`width: ${size.width}px; height: ${size.height}px;`" class="pspicture">
    <svg ref="svg" :width="`${size.width}px`" :height="`${size.height}px`" />
  </div>
</template>

<script>
import { psgraph } from '@latex2js/pstricks';
import * as d3 from 'd3';

export default {
  props: ['lines', 'plot', 'settings', 'env'],
  computed: {
    size() {
      return psgraph.getSize.call(this);
    },
  },
  mounted() {
    var svg = d3.select(this.$refs.svg);
    psgraph.pspicture.call(this, svg);
  },
};
</script>
