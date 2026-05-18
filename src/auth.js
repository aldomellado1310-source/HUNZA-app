import {
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase.js'

const provider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function logout() {
  await signOut(auth)
}

export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data().role : null
}

export async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      role: 'patient',
      createdAt: serverTimestamp(),
    })
  }
  return (await getDoc(ref)).data()
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}
