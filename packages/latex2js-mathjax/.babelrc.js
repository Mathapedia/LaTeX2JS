const useESModules = !!process.env.MODULE;

module.exports = (api) => {
  api.cache(() => process.env.MODULE);
  return {
    plugins: [
      ['@babel/transform-runtime', { useESModules }],
      '@babel/proposal-object-rest-spread',
      '@babel/proposal-class-properties',
      '@babel/proposal-export-default-from',
      'macros'
    ],
    presets: useESModules ? ['@babel/preset-typescript'] : ['@babel/env', '@babel/preset-typescript']
  };
};
