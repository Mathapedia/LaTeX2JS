<template>
  <div :style="`width: ${size.width}px; height: ${size.height}px;`" class="pspicture">
    <svg ref="svg" :width="`${size.width}px`" :height="`${size.height}px`" />
  </div>
</template>

<script>
import { psgraph } from '@latex2js/pstricks';
import { select } from '@latex2js/utils';

export default {
  props: ['lines', 'plot', 'settings', 'env'],
  computed: {
    size() {
      return psgraph.getSize.call(this);
    },
  },
  mounted() {
    var svg = select(this.$refs.svg);
    psgraph.pspicture.call(this, svg);
  },
};
</script>
