module.exports = {
  extends: [
    "plugin:vue-libs/recommended"
  ],
  plugins: [
    "node"
  ],
  env: {
    "jest": true
  },
  rules: {
    "indent": ["error", 2, {
      "MemberExpression": "off"
    }],
    "node/no-extraneous-require": ["error", {
      "allowModules": [
        "jslib-util"
      ]
    }],
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js'],
      rules: {
        "node/no-extraneous-require": "off"
      }
    }
  ]
}
