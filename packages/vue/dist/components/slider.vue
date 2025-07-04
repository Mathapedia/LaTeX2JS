<template>
<div>
  <h4> {{latex}} </h4>
  <p ref="p"></p>
  <input ref="input" :scalar="scalar"
        :variable="variable"
        type="range"
        :min="minValue"
        :max="maxValue"
        :value="value" />
  </div>
</template>
<script>
export default {
  props: [
    'latex',
    'scalar',
    'variable',
    'min',
    'max',
    'value',
    'env',
    'plot',
    'svg',
  ],
  data() {
    return {
      min: 0,
      max: 1,
      value: 1,
      latex: '',
      scalar: 1,
      varaible: '',
    };
  },
  computed: {
    minValue() {
      return this.min * this.scalar;
    },
    maxValue() {
      return this.max * this.scalar;
    },
  },
  mounted() {
    var slid = this.$refs.input;
    var p = this.$refs.p;
    var svg = this.svg;
    var env = this.env;
    var plots = this.plot;
    // THIS SHOULD DELEGATE, NOT BE RESPONSIBLE FOR RENDERING!
    // slid.on('change', function() {
    //   var value = this.value / this.getAttribute('scalar');
    //   var variable = this.getAttribute('variable');
    //   p.html(value);
    //   env.variables[variable] = value;
    //   svg.selectAll('.psplot').remove();
    //   _.each(plots, function(plot, k) {
    //     if (k.match(/psplot/)) {
    //       _.each(plot, function(data) {
    //         var d = data.fn.call(data.env, data.match);
    //         // var d = _.extend({}, data, env);
    //         psgraph[k].call(d, svg);
    //       });
    //     }
    //   });
    // });
    // var process = MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.el]);
    // if (typeof process === 'function') process();
  },
};
</script>
