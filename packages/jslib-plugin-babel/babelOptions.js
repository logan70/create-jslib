exports.config = api => {
  const config = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: 'last 2 versions, > 1%, ie >= 8, Android >= 4, iOS >= 6, and_uc > 9',
            node: '6'
          },
          // 是否将ES6模块转为CommonJS模块，必须为false，rollup只支持ES6模块
          modules: false,
          // 按需进行polyfill
          useBuiltIns: 'usage',
          corejs: '3.0.0'
        }
      ]
    ],
    plugins: [
      ['@babel/plugin-transform-runtime', { useESModules: true }],
      '@babel/plugin-syntax-dynamic-import'
    ]
  }
  return config
}
