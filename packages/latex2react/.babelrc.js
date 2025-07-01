const useESModules = !!process.env.MODULE;

module.exports = (api) => {
  api.cache(() => process.env.MODULE);
  return {
    plugins: [
      ['@babel/transform-runtime', { useESModules }],
      '@babel/proposal-object-rest-spread',
      '@babel/proposal-class-properties',
      '@babel/proposal-export-default-from',
      'babel-plugin-styled-components',
      'macros'
    ],
    presets: useESModules ? ['@babel/react', '@babel/preset-typescript'] : ['@babel/env', '@babel/react', '@babel/preset-typescript']
  };
};
