import LaTeX2JS from 'latex2js';
import latex from './latex.vue';

const install = (Vue, config) => {
  if (config) {
    if (config.options) {
      latex.props.globalOptions.default = () => config.options;
    }
    if (config.events) {
      latex.props.globalEvents.default = () => config.events;
    }
  }
  Vue.component(latex.name, latex);
};

const VueCodemirror = { LaTeX2JS, latex, install };

export default VueCodemirror;
export { LaTeX2JS, latex, install };
