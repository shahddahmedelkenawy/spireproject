import { db, storage } from 'src/boot/firebase'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { sanitizeFileNameForStorage } from 'src/utils/storagePaths'

export async function createCompany(payload) {
  const ref = await addDoc(collection(db, 'companies'), {
    ownerId: payload.ownerId,
    name: payload.name || '',
    email: payload.email || '',
    telephone: payload.telephone || '',
    employeeCount: payload.employeeCount ?? null,
    description: payload.description || '',
    taxesId: payload.taxesId || '',
    industry: payload.industry || '',
    userRate: payload.userRate || 0,
    accessibilityFeatures: payload.accessibilityFeatures || '',
    rules: payload.rules || '',
    address: payload.address || '',
    paymentFeeType: payload.paymentFeeType || '',
    type: payload.type || 'private',
    workingDays: payload.workingDays || '',
    workingHours: payload.workingHours || '',
    country: payload.country || '',
    logo: payload.logo || '',
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'companies', ref.id), { id: ref.id })
  return ref.id
}

export async function updateCompany(companyId, updates) {
  await updateDoc(doc(db, 'companies', companyId), updates)
}

export async function getCompany(companyId) {
  const snap = await getDoc(doc(db, 'companies', companyId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/** All company docs where ownerId matches (employer may have more than one in edge cases). */
export async function listCompaniesByOwner(ownerId) {
  if (!ownerId) return []
  const q = query(collection(db, 'companies'), where('ownerId', '==', ownerId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getCompanyByOwner(ownerId) {
  const list = await listCompaniesByOwner(ownerId)
  return list[0] ?? null
}

export async function listAllCompanies() {
  const snap = await getDocs(collection(db, 'companies'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function uploadCompanyLogo(ownerId, file) {
  const safeName = sanitizeFileNameForStorage(file.name)
  const path = `companies/${ownerId}/logo/${Date.now()}-${safeName}`
  const fileRef = storageRef(storage, path)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}

