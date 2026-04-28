import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

export async function createPaymentRecord(payload) {
  const ref = await addDoc(collection(db, 'payments'), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}
