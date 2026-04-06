import { defineBoot } from '#q-app/wrappers'
import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

/**
 * Must match Firebase Console → Project settings → Your apps → `storageBucket` exactly.
 * New projects often use `PROJECT_ID.firebasestorage.app` (not `*.appspot.com`); a mismatch causes 404 on uploads.
 * Override locally: `VITE_FIREBASE_STORAGE_BUCKET=your-bucket-id`
 */
const storageBucket =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
  'spire-b9fdb.firebasestorage.app'

const firebaseConfig = {
  apiKey: 'AIzaSyD6sMLbrHyO8Mb6qnRxfnlRxeDwjlbq-lo',
  authDomain: 'spire-b9fdb.firebaseapp.com',
  projectId: 'spire-b9fdb',
  storageBucket,
  messagingSenderId: '158084025839',
  appId: '1:158084025839:web:7a472be8cc37fde401fa1a',
  measurementId: 'G-VXELE9SCPJ',
}

const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)
// Single-arg: use the bucket from firebaseConfig (avoids wrong gs:// bucket and 404 preflight).
const storage = getStorage(firebaseApp)

let analytics = null
if (typeof window !== 'undefined') {
  analyticsSupported().then((ok) => {
    if (ok) {
      analytics = getAnalytics(firebaseApp)
    }
  })
}

export { firebaseApp, auth, db, storage, analytics }

export default defineBoot(() => {
  // Firebase is initialized through module side effects.
})

