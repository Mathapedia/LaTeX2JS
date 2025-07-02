<template>
  <div latex="true" v-html="text" class="nicebox math"></div>
</template>

<script>
export default {
  props: ['lines'],
  computed: {
    text() {
      return this.lines.join('\n');
    },
  },
};
</script>
