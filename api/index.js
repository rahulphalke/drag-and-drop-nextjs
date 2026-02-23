export default async function handler(req, res) {
  const { app, initApp } = await import('../dist/index.cjs');
  if (initApp) {
    await initApp();
  }
  return app(req, res);
}
