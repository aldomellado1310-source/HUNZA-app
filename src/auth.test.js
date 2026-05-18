// src/auth.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./firebase.js', () => ({ auth: {}, db: {} }))
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: class {
    constructor() {}
  },
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_, col, id) => `${col}/${id}`),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
}))

import { getUserRole, ensureUserDoc } from './auth.js'
import { getDoc, setDoc } from 'firebase/firestore'

describe('getUserRole', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna el role si el documento existe', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'doctor' }) })
    const role = await getUserRole('uid_doctor')
    expect(role).toBe('doctor')
  })

  it('retorna null si el documento no existe', async () => {
    getDoc.mockResolvedValue({ exists: () => false })
    const role = await getUserRole('uid_nuevo')
    expect(role).toBeNull()
  })
})

describe('ensureUserDoc', () => {
  beforeEach(() => vi.clearAllMocks())

  it('crea el documento con role patient si no existe', async () => {
    getDoc
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ role: 'patient', email: 'p@gmail.com' }) })

    const data = await ensureUserDoc({ uid: 'uid1', email: 'p@gmail.com' })

    expect(setDoc).toHaveBeenCalledWith('users/uid1', {
      email: 'p@gmail.com',
      role: 'patient',
      createdAt: 'SERVER_TS',
    })
    expect(data.role).toBe('patient')
  })

  it('no llama setDoc si el documento ya existe', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'doctor' }) })
    await ensureUserDoc({ uid: 'uid_doctor', email: 'd@gmail.com' })
    expect(setDoc).not.toHaveBeenCalled()
  })
})
