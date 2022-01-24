module.exports = function (config) {
  config.addPassthroughCopy('img');
  config.addPassthroughCopy('styles');
  config.addPassthroughCopy('js');
  config.addPassthroughCopy('data');
  return {
    dir: {
      input: './',
      output: 'dist',
      data: 'data'
    },
  };
};
