import { db, storage } from 'src/boot/firebase'
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  increment,
} from 'firebase/firestore'
import { addNotification } from 'src/services/notificationService'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { sanitizeFileNameForStorage } from 'src/utils/storagePaths'

/** Quasar QFile may emit a single File or File[] depending on props/version */
function normalizeUploadFile(file) {
  if (!file) return null
  if (Array.isArray(file)) return file[0] ?? null
  return file
}

export async function createUserProfile(userId, payload) {
  const userRef = doc(db, 'users', userId)
  const data = {
    id: userId,
    name: payload.name || '',
    email: payload.email || '',
    telephone: payload.telephone || '',
    gender: payload.gender || '',
    dateOfBirth: payload.dateOfBirth || '',
    age: payload.age ?? null,
    speciality: payload.speciality || '',
    education: payload.education || '',
    skills: Array.isArray(payload.skills) ? payload.skills : [],
    address: payload.address || '',
    cvFile: payload.cvFile || '',
    role: payload.role || 'jobseeker',
    companyName: payload.companyName || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await setDoc(userRef, data, { merge: true })
  return data
}

export async function getUserProfile(userId) {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? snap.data() : null
}

/** Merges into `users/{userId}` — works even if the document was missing or incomplete */
export async function updateUserProfile(userId, updates) {
  if (!userId) {
    throw new Error('updateUserProfile: userId is required')
  }
  await setDoc(doc(db, 'users', userId), updates, { merge: true })
}

export async function uploadUserCV(userId, file) {
  const f = normalizeUploadFile(file)
  if (!f?.name) throw new Error('Invalid file for CV upload')
  const safeName = sanitizeFileNameForStorage(f.name)
  const path = `users/${userId}/cv/${Date.now()}-${safeName}`
  const fileRef = storageRef(storage, path)
  await uploadBytes(fileRef, f)
  const url = await getDownloadURL(fileRef)
  await updateUserProfile(userId, { cvFile: url })
  return url
}

export async function uploadProfilePhoto(userId, file) {
  const f = normalizeUploadFile(file)
  if (!userId || !f?.name) return null
  const safeName = sanitizeFileNameForStorage(f.name)
  const path = `users/${userId}/avatar/${Date.now()}-${safeName}`
  const fileRef = storageRef(storage, path)
  await uploadBytes(fileRef, f)
  const url = await getDownloadURL(fileRef)
  await updateUserProfile(userId, { profilePhotoUrl: url })
  return url
}

export async function getFriendRequestById(requestId) {
  const snap = await getDoc(doc(db, 'friendRequests', requestId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function sendFriendRequest(senderId, receiverId) {
  // Single-field query only (avoids composite index requirement in Firebase)
  const existing = await getDocs(
    query(collection(db, 'friendRequests'), where('senderId', '==', senderId)),
  )
  const pending = existing.docs.find((d) => {
    const data = d.data()
    return data.receiverId === receiverId && data.status === 'pending'
  })
  if (pending) return pending.id

  const senderProfile = await getUserProfile(senderId)
  const ref = await addDoc(collection(db, 'friendRequests'), {
    senderId,
    receiverId,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  await addNotification({
    userId: receiverId,
    type: 'request',
    message: `${senderProfile?.name || 'Someone'} wants to connect with you.`,
    title: 'New follow request',
    subtitle: `${senderProfile?.name || 'Someone'} wants to connect with you.`,
    icon: 'person_add',
    friendRequestId: ref.id,
    senderId,
    senderName: senderProfile?.name || '',
    senderImage: senderProfile?.profilePhotoUrl || '',
  })
  return ref.id
}

export async function acceptFriendRequest(requestId) {
  const req = await getFriendRequestById(requestId)
  if (!req || req.status !== 'pending') return
  await updateDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' })
  const senderRef = doc(db, 'users', req.senderId)
  const receiverRef = doc(db, 'users', req.receiverId)
  await updateDoc(senderRef, { followersCount: increment(1) }).catch(() => {})
  await updateDoc(receiverRef, { followersCount: increment(1) }).catch(() => {})
  const [receiverProfile, senderProfile] = await Promise.all([
    getUserProfile(req.receiverId),
    getUserProfile(req.senderId),
  ])

  const receiverName = receiverProfile?.name || 'Someone'
  const senderName = senderProfile?.name || 'Someone'

  // Original requester: "X accepted your connection request."
  await addNotification({
    userId: req.senderId,
    type: 'connection',
    message: `${receiverName} accepted your connection request.`,
    title: 'Connection accepted',
    subtitle: `${receiverName} accepted your connection request.`,
    icon: 'check_circle',
    triggeredBy: req.receiverId,
    senderId: req.receiverId,
    senderName: receiverName,
    senderImage: receiverProfile?.profilePhotoUrl || '',
  })

  // Person who accepted: "You're now connected with X."
  await addNotification({
    userId: req.receiverId,
    type: 'connection',
    message: `You're now connected with ${senderName}.`,
    title: 'Connection accepted',
    subtitle: `You accepted ${senderName}'s connection request.`,
    icon: 'check_circle',
    senderId: req.senderId,
    senderName,
    senderImage: senderProfile?.profilePhotoUrl || '',
  })
}

export async function rejectFriendRequest(requestId) {
  const req = await getFriendRequestById(requestId)
  if (!req || req.status !== 'pending') return
  await updateDoc(doc(db, 'friendRequests', requestId), { status: 'rejected' })
}

export async function updateFriendRequestStatus(requestId, status) {
  await updateDoc(doc(db, 'friendRequests', requestId), { status })
}

export async function listFriendRequestsForUser(userId) {
  const q = query(collection(db, 'friendRequests'), where('receiverId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function listPendingInvitesForUser(userId) {
  const rows = await listFriendRequestsForUser(userId)
  const pending = rows.filter((r) => r.status === 'pending')
  const enriched = await Promise.all(
    pending.map(async (r) => {
      const profile = await getUserProfile(r.senderId)
      const name = profile?.name || 'User'
      const initials = name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
      return {
        id: r.id,
        senderId: r.senderId,
        name,
        role: profile?.speciality || profile?.fieldDescription || 'Professional',
        initials: initials || 'US',
      }
    })
  )
  return enriched
}

export async function listAllUsersExcept(excludeUserId) {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.id !== excludeUserId)
}

export async function listOutgoingPendingFriendRequests(senderId) {
  const q = query(collection(db, 'friendRequests'), where('senderId', '==', senderId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => r.status === 'pending')
}

export async function countAcceptedConnectionsForUser(userId) {
  const [s1, s2] = await Promise.all([
    getDocs(query(collection(db, 'friendRequests'), where('senderId', '==', userId))),
    getDocs(query(collection(db, 'friendRequests'), where('receiverId', '==', userId))),
  ])
  const seen = new Set()
  for (const d of [...s1.docs, ...s2.docs]) {
    const data = d.data()
    if (data.status === 'accepted') {
      seen.add(d.id)
    }
  }
  return seen.size
}


