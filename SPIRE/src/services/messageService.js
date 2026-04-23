import { db } from 'src/boot/firebase'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { ASSISTANT_PEER_ID } from 'src/constants/messaging'
import { addNotification } from './notificationService'
import { getUserProfile } from './userService'

export async function sendMessage({ senderId, receiverId, message }) {
  const ref = await addDoc(collection(db, 'messages'), {
    senderId,
    receiverId,
    message,
    createdAt: serverTimestamp(),
    seen: false,
  })
  await updateDoc(doc(db, 'messages', ref.id), { id: ref.id })

  const isAssistantThread =
    senderId === ASSISTANT_PEER_ID || receiverId === ASSISTANT_PEER_ID
  if (!isAssistantThread && senderId && receiverId) {
    try {
      const sender = await getUserProfile(senderId)
      const preview = String(message || '').trim().slice(0, 140)
      const name = sender?.name || 'Someone'
      await addNotification({
        userId: receiverId,
        type: 'message',
        message: preview ? `${name}: ${preview}` : `New message from ${name}`,
        title: 'New message',
        subtitle: preview || 'Open Messages to read.',
        icon: 'chat_bubble_outline',
        senderId,
        senderName: name,
        senderImage: sender?.profilePhotoUrl || '',
      })
    } catch (e) {
      console.warn('Could not notify recipient of new message:', e)
    }
  }

  return ref.id
}

export async function getChatHistory(userA, userB) {
  const q1 = query(
    collection(db, 'messages'),
    where('senderId', '==', userA),
    where('receiverId', '==', userB),
    orderBy('createdAt', 'asc')
  )
  const q2 = query(
    collection(db, 'messages'),
    where('senderId', '==', userB),
    where('receiverId', '==', userA),
    orderBy('createdAt', 'asc')
  )

  const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)])
  const merged = [
    ...s1.docs.map((d) => ({ id: d.id, ...d.data() })),
    ...s2.docs.map((d) => ({ id: d.id, ...d.data() })),
  ]

  return merged.sort((a, b) => {
    const at = a.createdAt?.toMillis?.() || 0
    const bt = b.createdAt?.toMillis?.() || 0
    return at - bt
  })
}

/**
 * Real-time merged thread between two users. Calls onUpdate with sorted message list.
 * @returns {() => void} unsubscribe
 */
export function subscribeChatHistory(userA, userB, onUpdate, onError) {
  const q1 = query(
    collection(db, 'messages'),
    where('senderId', '==', userA),
    where('receiverId', '==', userB),
    orderBy('createdAt', 'asc')
  )
  const q2 = query(
    collection(db, 'messages'),
    where('senderId', '==', userB),
    where('receiverId', '==', userA),
    orderBy('createdAt', 'asc')
  )

  let snap1 = []
  let snap2 = []

  const emit = () => {
    const merged = [...snap1, ...snap2].sort((a, b) => {
      const at = a.createdAt?.toMillis?.() || 0
      const bt = b.createdAt?.toMillis?.() || 0
      return at - bt
    })
    onUpdate(merged)
  }

  const handleErr = (err) => {
    console.error('[messages] subscribeChatHistory', err)
    if (typeof onError === 'function') onError(err)
  }

  const unsub1 = onSnapshot(
    q1,
    (s) => {
      snap1 = s.docs.map((d) => ({ id: d.id, ...d.data() }))
      emit()
    },
    handleErr
  )
  const unsub2 = onSnapshot(
    q2,
    (s) => {
      snap2 = s.docs.map((d) => ({ id: d.id, ...d.data() }))
      emit()
    },
    handleErr
  )

  return () => {
    unsub1()
    unsub2()
  }
}

export async function markMessageSeen(messageId) {
  await updateDoc(doc(db, 'messages', messageId), { seen: true })
}

const BATCH_SIZE = 450

/**
 * Deletes all messages between two participants (both directions). Uses batched writes (max 500 ops per batch).
 */
export async function deleteAllMessagesInThread(userId, peerId) {
  if (!userId || !peerId) {
    throw new Error('deleteAllMessagesInThread: userId and peerId are required')
  }
  const q1 = query(
    collection(db, 'messages'),
    where('senderId', '==', userId),
    where('receiverId', '==', peerId),
    orderBy('createdAt', 'asc'),
  )
  const q2 = query(
    collection(db, 'messages'),
    where('senderId', '==', peerId),
    where('receiverId', '==', userId),
    orderBy('createdAt', 'asc'),
  )
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])
  const ids = [...snap1.docs, ...snap2.docs].map((d) => d.id)
  if (!ids.length) return

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const slice = ids.slice(i, i + BATCH_SIZE)
    const batch = writeBatch(db)
    for (const id of slice) {
      batch.delete(doc(db, 'messages', id))
    }
    await batch.commit()
  }
}

export async function listUserConversations(userId) {
  const qSent = query(
    collection(db, 'messages'),
    where('senderId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const qReceived = query(
    collection(db, 'messages'),
    where('receiverId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  const [sentSnap, receivedSnap] = await Promise.all([getDocs(qSent), getDocs(qReceived)])

  const all = [
    ...sentSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    ...receivedSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  ]

  all.sort((a, b) => {
    const at = a.createdAt?.toMillis?.() || 0
    const bt = b.createdAt?.toMillis?.() || 0
    return bt - at
  })

  const convoMap = new Map()
  for (const item of all) {
    const peerId = item.senderId === userId ? item.receiverId : item.senderId
    if (!convoMap.has(peerId)) {
      convoMap.set(peerId, {
        peerId,
        lastMessage: item.message || '',
        time: item.createdAt,
        unreadCount: 0,
      })
    }
    if (item.receiverId === userId && !item.seen) {
      convoMap.get(peerId).unreadCount += 1
    }
  }

  const entries = Array.from(convoMap.values()).filter((e) => e.peerId !== ASSISTANT_PEER_ID)
  const withProfiles = await Promise.all(
    entries.map(async (entry) => {
      const profile = await getUserProfile(entry.peerId)
      const name = profile?.name || 'User'
      const initials = name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
      return {
        ...entry,
        name,
        initials: initials || 'US',
        profilePhotoUrl: profile?.profilePhotoUrl || '',
      }
    })
  )

  return withProfiles
}

