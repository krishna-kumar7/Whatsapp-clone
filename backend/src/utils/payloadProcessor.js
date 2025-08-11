require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const messageController = require('../controllers/messageController');

const MONGODB_URI = process.env.MONGODB_URI;

async function processPayloads(dir) {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // If the file contains an array, process each item
    if (Array.isArray(data)) {
      for (const payload of data) {
        await messageController.processPayload(payload, null);
        console.log(`Processed payload from ${file}`);
      }
    } else {
      await messageController.processPayload(data, null);
      console.log(`Processed payload from ${file}`);
    }
  }
  await mongoose.disconnect();
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('Usage: node src/utils/payloadProcessor.js <payloads_dir>');
    process.exit(1);
  }
  processPayloads(dir).then(() => {
    console.log('All payloads processed.');
    process.exit(0);
  });
}
