import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { logAudit } from './audit.js'

export async function getAllPatients(actorUid, actorRole) {
  const snap = await getDocs(collection(db, 'patients'))
  const patients = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  for (const p of patients) {
    await logAudit('read', p.id, actorUid, actorRole)
  }
  return patients
}

export async function getPatientByEmail(email) {
  const snap = await getDocs(query(collection(db, 'patients'), where('email', '==', email)))
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function getPatientByUid(uid) {
  const snap = await getDocs(query(collection(db, 'patients'), where('linkedUid', '==', uid)))
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function createPatient(data, doctorUid) {
  const ref = await addDoc(collection(db, 'patients'), {
    ...data,
    linkedUid: null,
    photos: [],
    onboardingDone: false,
    createdBy: doctorUid,
    createdAt: serverTimestamp(),
  })
  await logAudit('write', ref.id, doctorUid, 'doctor')
  return ref.id
}

export async function updatePatient(id, data, actorUid, actorRole) {
  await updateDoc(doc(db, 'patients', id), data)
  await logAudit('write', id, actorUid, actorRole)
}

export async function setPriority(id, priority, doctorUid) {
  await updateDoc(doc(db, 'patients', id), { priority })
  await logAudit('write', id, doctorUid, 'doctor')
}

export async function linkPatient(id, uid) {
  await updateDoc(doc(db, 'patients', id), { linkedUid: uid })
}

export async function completeOnboarding(id) {
  await updateDoc(doc(db, 'patients', id), { onboardingDone: true })
}
