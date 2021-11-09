"use strict";
const path = require("path");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const resolve = (dir) => path.join(__dirname, dir);
const port = 8080; // 端口配置

module.exports = {
  // module: {
  //     // rules配置loader信息
  //     rules:[{
  //         // 判断如果文件是.css结尾的那么就用css-loader在处理。并不是打包所有的css而是从入口中搜集依赖
  //         test: /\.ts$/,
  //         loader: 'ts-loader'
  //     }]
  // },
  publicPath: process.env.NODE_ENV === "development" ? "/" : "./",
  outputDir: "dist",
  assetsDir: "static",
  indexPath: "index.html",

  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm.js",
        "@": resolve("src"),
        assets: resolve("src/assets"),
        components: resolve("src/components"),
        views: resolve("src/views"),
        api: resolve("src/api"),
        utils: resolve("src/utils"),
      },
    },

    // plugins:
    //     process.env.NODE_ENV === 'production'
    //         ? [
    //               new FileManagerPlugin({
    //                   onEnd: {
    //                       archive: [
    //                           {
    //                               source: `./GovPolicyMatch-FrontEnd`,
    //                               destination: `./GovPolicyMatch-FrontEnd.zip`,
    //                           },
    //                       ],
    //                   },
    //               }),
    //               new TerserPlugin({
    //                   //采用多进程打包
    //                   parallel: 4,
    //                   terserOptions: {
    //                       compress: {
    //                           // 去除debug、console
    //                           warnings: true,
    //                           drop_debugger: true,
    //                           drop_console: true,
    //                           // 保持类名不被压缩
    //                           keep_fnames: true,
    //                       },
    //                   },
    //               }),
    //               new CompressionPlugin({
    //                   test: ['js', 'css'],
    //                   filename: '[path].gz[query]', //压缩后的文件策略
    //                   algorithm: 'gzip', //压缩方式
    //                   threshold: 8192, //大于8192字节的文件启用压缩
    //                   minRatio: 0.8, // 压缩比率大于等于0.8时不进行压缩
    //                   deleteOriginalAssets: true,
    //               }),
    //               new BundleAnalyzerPlugin(),
    //           ]
    //         : [],
  },
  chainWebpack(config) {
    // 移除 prefetch 插件
    config.plugins.delete("prefetch");
    // 移除 preload 插件
    config.plugins.delete("preload");

    // config
    //     .plugin('webpack-bundle-analyzer')
    //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
  },
  pages: {
    index: {
      entry: "src/main.js",
      template: "public/index.html",
      filename: "index.html",
      title: "", // 当使用 title 选项时,在 template 中使用：<title><%= htmlWebpackPlugin.options.title %></title>
      chunks: ["chunk-vendors", "chunk-common", "index"], // 在这个页面中包含的块，默认情况下会包含,提取出来的通用 chunk 和 vendor chunk
    },
  },
  lintOnSave: false,
  productionSourceMap: true, // 生产环境是否生成 sourceMap 文件
  runtimeCompiler: true, // 是否开启构建版本 开启增加 10KB左右   实现支持template编译
  css: {
    // extract: false, // 是否使用css分离插件 ExtractTextPlugin
    sourceMap: false, // 开启 CSS source maps
    requireModuleExtension: true,
    loaderOptions: {},
  },
  transpileDependencies: [],
  devServer: {
    // 环境配置
    contentBase: resolve("GovPolicyMatch-FrontEnd"),
    port,
    https: false,
    hotOnly: false,
    open: true, // 配置自动启动浏览器
    compress: true, // 启用gzip压缩
    proxy: {
      "/api": {
        target: "http://192.168.1.240:8082",
        changeOrigin: true, // 是否改变域名
        ws: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
  pluginOptions: {},
};
