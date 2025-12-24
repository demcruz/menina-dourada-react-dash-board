const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/produtos',
    createProxyMiddleware({
      target: 'https://api.meninadourada.shop',
      changeOrigin: true,
      secure: true,
      logLevel: 'debug',
      onError: function (err, req, res) {
        console.log('Proxy error:', err);
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('Proxying request to:', proxyReq.path);
      }
    })
  );
  
  app.use(
    '/images',
    createProxyMiddleware({
      target: 'https://api.meninadourada.shop',
      changeOrigin: true,
      secure: true,
      logLevel: 'debug'
    })
  );
};