// src/services/patients.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../firebase.js', () => ({ db: {} }))
vi.mock('./audit.js', () => ({ logAudit: vi.fn() }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'col_ref'),
  doc: vi.fn((_, __, id) => `doc_ref_${id}`),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn((col, ...constraints) => `query(${col})`),
  where: vi.fn((field, op, val) => `where(${field}${op}${val})`),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
}))

import {
  createPatient,
  getPatientByEmail,
  getPatientByUid,
  setPriority,
  linkPatient,
  completeOnboarding,
} from './patients.js'
import { addDoc, updateDoc, getDocs } from 'firebase/firestore'
import { logAudit } from './audit.js'

describe('createPatient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('crea el documento con linkedUid null y llama logAudit', async () => {
    addDoc.mockResolvedValue({ id: 'new_patient_id' })

    const id = await createPatient(
      { name: 'Valentina', email: 'v@gmail.com', procedure: 'Lipo', priority: 'yellow' },
      'doctor_uid'
    )

    expect(addDoc).toHaveBeenCalledWith('col_ref', expect.objectContaining({
      linkedUid: null,
      photos: [],
      onboardingDone: false,
      createdBy: 'doctor_uid',
    }))
    expect(logAudit).toHaveBeenCalledWith('write', 'new_patient_id', 'doctor_uid', 'doctor')
    expect(id).toBe('new_patient_id')
  })
})

describe('getPatientByEmail', () => {
  it('retorna null si no hay resultados', async () => {
    getDocs.mockResolvedValue({ empty: true, docs: [] })
    const result = await getPatientByEmail('nobody@gmail.com')
    expect(result).toBeNull()
  })

  it('retorna el paciente si existe', async () => {
    getDocs.mockResolvedValue({
      empty: false,
      docs: [{ id: 'p1', data: () => ({ name: 'Valentina', email: 'v@gmail.com' }) }],
    })
    const result = await getPatientByEmail('v@gmail.com')
    expect(result).toEqual({ id: 'p1', name: 'Valentina', email: 'v@gmail.com' })
  })
})

describe('getPatientByUid', () => {
  it('retorna null si no hay resultados', async () => {
    getDocs.mockResolvedValue({ empty: true, docs: [] })
    const result = await getPatientByUid('uid_inexistente')
    expect(result).toBeNull()
  })

  it('retorna el paciente vinculado', async () => {
    getDocs.mockResolvedValue({
      empty: false,
      docs: [{ id: 'p2', data: () => ({ name: 'Camila', linkedUid: 'uid_camila' }) }],
    })
    const result = await getPatientByUid('uid_camila')
    expect(result).toEqual({ id: 'p2', name: 'Camila', linkedUid: 'uid_camila' })
  })
})

describe('setPriority', () => {
  it('actualiza priority y llama logAudit', async () => {
    updateDoc.mockResolvedValue()
    await setPriority('p1', 'red', 'doctor_uid')
    expect(updateDoc).toHaveBeenCalledWith('doc_ref_p1', { priority: 'red' })
    expect(logAudit).toHaveBeenCalledWith('write', 'p1', 'doctor_uid', 'doctor')
  })
})

describe('linkPatient', () => {
  it('escribe linkedUid en el documento', async () => {
    updateDoc.mockResolvedValue()
    await linkPatient('p1', 'uid_valentina')
    expect(updateDoc).toHaveBeenCalledWith('doc_ref_p1', { linkedUid: 'uid_valentina' })
  })
})

describe('completeOnboarding', () => {
  it('escribe onboardingDone: true', async () => {
    updateDoc.mockResolvedValue()
    await completeOnboarding('p1')
    expect(updateDoc).toHaveBeenCalledWith('doc_ref_p1', { onboardingDone: true })
  })
})
