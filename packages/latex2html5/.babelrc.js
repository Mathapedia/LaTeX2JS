const useESModules = !!process.env.MODULE;

module.exports = (api) => {
  api.cache(() => process.env.MODULE);
  return {
    plugins: [
      ['@babel/transform-runtime', { useESModules }],
      'macros'
    ],
    presets: useESModules ? ['@babel/preset-typescript'] : ['@babel/env', '@babel/preset-typescript']
  };
};
