
import fs from 'fs';

try {
  const content = fs.readFileSync('webhook_receipts.txt', 'utf8');
  // Hacky way to parse the JSON from the log format
  const parts = content.split('--- MOCK WEBHOOK RECEIVED at');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    const jsonStr = lastPart.substring(lastPart.indexOf('{'), lastPart.lastIndexOf('}') + 1);
    const data = JSON.parse(jsonStr);
    console.log('--- EXTRACTED PAYLOAD ---');
    console.log(JSON.stringify(data.data, null, 2));
    console.log('--- RAW PAYLOAD (Original IDs) ---');
    console.log(JSON.stringify(data.raw_data, null, 2));
  } else {
    console.log('No webhook data found.');
  }
} catch (err) {
  console.error(err);
}
