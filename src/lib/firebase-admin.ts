import { initializeApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let _app: App | null = null;
let _db: Firestore | null = null;

function getApp(): App {
  if (_app) return _app;

  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT;

  const sa = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (sa) {
    _app = initializeApp({
      credential: cert(JSON.parse(sa)),
      projectId,
    });
    return _app;
  }

  _app = initializeApp({
    credential: applicationDefault(),
    projectId,
  });
  return _app;
}

export function db(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getApp());
  return _db;
}
