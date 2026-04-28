import { db } from 'src/boot/firebase'
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { getUserProfile } from './userService'

export async function createRating({ fromUser, toUser, rating, review }) {
  const ref = await addDoc(collection(db, 'ratings'), {
    fromUser,
    toUser,
    rating,
    review: review || '',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getRatingsForUser(userId) {
  const q = query(collection(db, 'ratings'), where('toUser', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getRatingsForUserWithSenderNames(userId) {
  const rows = await getRatingsForUser(userId)
  return Promise.all(
    rows.map(async (r) => {
      const p = await getUserProfile(r.fromUser)
      return {
        ...r,
        fromUserName: p?.name || 'User',
      }
    })
  )
}
