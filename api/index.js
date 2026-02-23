const { app, initApp } = require('../dist/index.cjs');

module.exports = async function handler(req, res) {
  if (initApp) {
    await initApp();
  }
  return app(req, res);
};
