// src/services/audit.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../firebase.js', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'audit_logs_ref'),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
}))

import { logAudit } from './audit.js'
import { addDoc, collection } from 'firebase/firestore'

describe('logAudit', () => {
  beforeEach(() => vi.clearAllMocks())

  it('escribe un documento en audit_logs con los campos correctos', async () => {
    addDoc.mockResolvedValue({ id: 'log1' })

    await logAudit('read', 'patient123', 'uid456', 'doctor')

    expect(collection).toHaveBeenCalledWith({}, 'audit_logs')
    expect(addDoc).toHaveBeenCalledWith('audit_logs_ref', {
      action: 'read',
      patientId: 'patient123',
      actorUid: 'uid456',
      actorRole: 'doctor',
      timestamp: 'SERVER_TS',
    })
  })

  it('funciona con role patient', async () => {
    addDoc.mockResolvedValue({ id: 'log2' })
    await logAudit('read', 'patient123', 'uid789', 'patient')
    expect(addDoc).toHaveBeenCalledWith('audit_logs_ref', expect.objectContaining({ actorRole: 'patient' }))
  })
})
