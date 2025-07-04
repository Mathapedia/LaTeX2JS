<template>
  <ul v-html="items" class="enumerate math"></ul>
</template>
<script>
export default {
  props: ['lines'],
  computed: {
    items() {
      return this.lines
        .map(line => {
          var m = line.match(/\\item (.*)/);
          if (m) {
            return '<li>' + m[1] + '</li>';
          } else {
            return line;
          }
        })
        .join('\n');
    },
  },
};
</script>
