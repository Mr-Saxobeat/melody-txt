module.exports = function override(config) {
  config.module.rules.push({
    test: /\.m?js$/,
    include: /node_modules\/tone/,
    type: 'javascript/auto',
    resolve: {
      fullySpecified: false,
    },
  });
  return config;
};
