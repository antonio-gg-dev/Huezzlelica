const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: './',
  transpileDependencies: true,
  pwa: {
    name: 'Huezzlelica',
    themeColor: '#2ecc71',
  }
})
