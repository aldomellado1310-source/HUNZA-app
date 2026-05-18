import './style.css'
import { createIcons, icons } from 'lucide'
import { onAuthChange, getUserRole, ensureUserDoc, signInWithGoogle, logout } from './auth.js'
import { mountLogin } from './views/login.js'
import { mountDoctor } from './views/doctor.js'
import { mountPatient } from './views/patient.js'

export function refreshIcons() {
  createIcons({ icons })
}

const app = document.getElementById('app')

onAuthChange(async (user) => {
  if (!user) {
    mountLogin(app, handleGoogleLogin)
    refreshIcons()
    return
  }

  await ensureUserDoc(user)
  const role = await getUserRole(user.uid)

  if (role === 'doctor') {
    await mountDoctor(app, user, handleLogout)
    refreshIcons()
  } else {
    await mountPatient(app, user, handleLogout)
    refreshIcons()
  }
})

async function handleGoogleLogin() {
  try {
    await signInWithGoogle()
    // onAuthChange fires automatically — no manual navigation needed
  } catch (err) {
    const errEl = document.getElementById('login-error')
    if (errEl) errEl.textContent = 'Error al iniciar sesión. Intentá de nuevo.'
  }
}

async function handleLogout() {
  await logout()
  // onAuthChange fires automatically with user=null
}
