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

const sa = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
initializeApp({
  credential: sa ? cert(JSON.parse(sa)) : applicationDefault(),
  projectId,
});

const db = getFirestore();

async function seed() {
  console.log(`Seeding project: ${projectId}`);

  const phrasesCol = db.collection('scam_phrases');
  const numbersCol = db.collection('scam_numbers');

  const existingPhrases = await phrasesCol.limit(1).get();
  if (!existingPhrases.empty) {
    console.log(`scam_phrases already has data; skipping. Delete manually if you want to reseed.`);
  } else {
    const batch = db.batch();
    for (const p of phrases as unknown as Array<{ id: string }>) {
      batch.set(phrasesCol.doc(p.id), p);
    }
    await batch.commit();
    console.log(`Seeded ${phrases.length} scam_phrases`);
  }

  const existingNumbers = await numbersCol.limit(1).get();
  if (!existingNumbers.empty) {
    console.log(`scam_numbers already has data; skipping.`);
  } else {
    const batch = db.batch();
    for (const n of numbers as unknown as Array<{ phone: string }>) {
      batch.set(numbersCol.doc(n.phone.replace(/\D/g, '')), n);
    }
    await batch.commit();
    console.log(`Seeded ${numbers.length} scam_numbers`);
  }

  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
