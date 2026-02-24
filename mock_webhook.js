
import express from 'express';
import fs from 'fs';
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  const logEntry = `\n--- MOCK WEBHOOK RECEIVED at ${new Date().toISOString()} ---\n${JSON.stringify(req.body, null, 2)}\n`;
  console.log(logEntry);
  fs.appendFileSync('webhook_receipts.txt', logEntry, 'utf8');
  res.status(200).send('Webhook received');
});

const port = 9999;
app.listen(port, () => {
  console.log(`Mock webhook server listening at http://localhost:${port}/webhook`);
});
