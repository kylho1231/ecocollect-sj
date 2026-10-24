/**
 * Seed script for EcoCollect SJ Firestore Database
 * Loads verified barangays, puroks, waste categories, and honest schedules.
 *
 * Usage:
 *   1. Against local emulator:
 *      FIRESTORE_EMULATOR_HOST=localhost:8080 node seeds/seed_firestore.js
 *   2. Against production:
 *      GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json node seeds/seed_firestore.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'funda_dalipe_seed.json'), 'utf8')
);

const isEmulator = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
const [host, port] = isEmulator.split(':');
const projectId = process.env.FIREBASE_PROJECT_ID || 'ecocollect-sj';

console.log(`Connecting to Firestore at ${host}:${port} for project [${projectId}]...`);

// Helper to push document via Firestore REST API (no admin SDK required)
function pushDocument(collection, docId, data) {
  return new Promise((resolve, reject) => {
    // Transform JS object to Firestore REST format
    const fields = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        fields[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        fields[key] = Number.isInteger(value)
          ? { integerValue: value.toString() }
          : { doubleValue: value };
      } else if (typeof value === 'boolean') {
        fields[key] = { booleanValue: value };
      } else if (Array.isArray(value)) {
        fields[key] = {
          arrayValue: {
            values: value.map((v) =>
              typeof v === 'string'
                ? { stringValue: v }
                : { stringValue: JSON.stringify(v) }
            ),
          },
        };
      }
    }

    const payload = JSON.stringify({ fields });
    const options = {
      hostname: host,
      port: parseInt(port, 10),
      path: `/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': 'Bearer owner',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`  ✓ Created ${collection}/${docId}`);
          resolve(true);
        } else {
          console.error(`  ✗ Failed ${collection}/${docId}: HTTP ${res.statusCode} - ${body}`);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`  ✗ Network error connecting to ${collection}/${docId}:`, e.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

async function runSeed() {
  console.log('\n--- 1. Seeding Barangays & Pilot Funda-Dalipe ---');
  for (const b of seedData.barangays) {
    await pushDocument('barangays', b.id, {
      name: b.name,
      municipality: b.municipality,
      isPilot: b.isPilot,
      purokCount: b.puroks ? b.puroks.length : 0,
    });
  }

  console.log('\n--- 2. Seeding Schedules (Pending & Verified) ---');
  for (const s of seedData.collection_schedules) {
    await pushDocument('collection_schedules', s.id, {
      barangayId: s.barangayId,
      barangayName: s.barangayName,
      wasteCategory: s.wasteCategory,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      verificationStatus: s.verificationStatus,
      statusDescription: s.statusDescription || '',
      officialReference: s.officialReference || '',
      verifiedByUserName: s.verifiedByUserName || '',
      notes: s.notes || '',
    });
  }

  console.log('\nSeed process completed!');
}

runSeed();
