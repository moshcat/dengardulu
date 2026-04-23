import 'dotenv/config';
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import phrases from '../src/data/scam_phrases.seed.json' with { type: 'json' };
import numbers from '../src/data/scam_numbers.seed.json' with { type: 'json' };

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
if (!projectId) {
  console.error('Missing FIREBASE_PROJECT_ID env var');
  process.exit(1);
}

const force = process.argv.includes('--force');

const sa = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
initializeApp({
  credential: sa ? cert(JSON.parse(sa)) : applicationDefault(),
  projectId,
});

const db = getFirestore();

async function upsertCollection<T extends { id?: string; phone?: string }>(
  name: string,
  items: T[],
  keyFn: (item: T) => string
) {
  const col = db.collection(name);
  const existing = await col.limit(1).get();

  if (!existing.empty && !force) {
    console.log(`${name} already has data; skipping. Pass --force to upsert.`);
    return;
  }

  if (force && !existing.empty) {
    console.log(`${name}: --force set, upserting ${items.length} docs (existing docs overwritten by id; stale docs kept)`);
  }

  // Firestore batch limit is 500 writes; chunk to be safe
  const CHUNK = 400;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = db.batch();
    for (const item of items.slice(i, i + CHUNK)) {
      batch.set(col.doc(keyFn(item)), item as FirebaseFirestore.DocumentData);
    }
    await batch.commit();
  }
  console.log(`Seeded ${items.length} ${name}`);
}

async function seed() {
  console.log(`Seeding project: ${projectId}${force ? ' (FORCE mode — upsert)' : ''}`);

  await upsertCollection(
    'scam_phrases',
    phrases as unknown as Array<{ id: string }>,
    (p) => p.id
  );

  await upsertCollection(
    'scam_numbers',
    numbers as unknown as Array<{ phone: string }>,
    (n) => n.phone.replace(/\D/g, '')
  );

  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
