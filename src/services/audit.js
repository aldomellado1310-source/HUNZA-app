import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'

export async function logAudit(action, patientId, actorUid, actorRole) {
  await addDoc(collection(db, 'audit_logs'), {
    action,
    patientId,
    actorUid,
    actorRole,
    timestamp: serverTimestamp(),
  })
}
