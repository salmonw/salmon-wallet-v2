#!/usr/bin/env node

process.env.NODE_ENV = 'production';

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpack = require('webpack');
const webpackConfigProd = require('react-scripts/config/webpack.config')(
  'production',
);

webpackConfigProd.plugins.push(
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    reportFilename: 'bundle-report.html',
    openAnalyzer: false,
    generateStatsFile: true,
    statsFilename: 'bundle-stats.json',
  }),
);

webpack(webpackConfigProd, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(err || stats.toString());
    process.exit(1);
  }
  console.log('Bundle analysis complete! Check bundle-report.html');
});
