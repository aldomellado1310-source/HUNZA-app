// scripts/seed.js — ejecutar UNA VEZ con: node --env-file=.env scripts/seed.js
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const patients = [
  {
    name: 'Valentina Soto',
    email: 'REEMPLAZAR_CON_EMAIL_REAL_DE_VALENTINA@gmail.com',
    procedure: 'Liposucción Láser Ambulatoria',
    stage: 'Semana 2 - Kinesiología Postoperatoria',
    priority: 'yellow',
    nextControl: new Date('2026-05-28T12:00:00'),
    pendingAppointment: 'Sesión de Drenaje Linfático (Semana 2)',
    currentMilestone: 2,
    milestones: [
      { day: 'Día 1', title: 'Procedimiento', desc: 'Cirugía ambulatoria. Reposo y cuidados iniciales.', completed: true },
      { day: 'Día 7', title: 'Uso de Faja', desc: 'Uso estricto de faja y postura por 10 a 14 días.', completed: true },
      { day: 'Semana 2', title: 'Drenaje Linfático', desc: 'Inicio de 8 a 12 sesiones de kinesiología.', completed: false },
      { day: 'Mes 1', title: 'Reducción 40%', desc: 'Desinflamación visible del 40-50%.', completed: false },
      { day: 'Mes 3', title: 'Resultado 80%', desc: 'Resultado avanzado y moldeado evidente.', completed: false },
      { day: 'Mes 6', title: 'Alta Definitiva', desc: 'Resultado final y definitivo.', completed: false },
    ],
    faqs: [
      { q: '¿Debo usar faja de compresión?', a: 'Sí, es obligatorio. Se recomienda cuidados exhaustivos desde el punto de vista de uso de faja y postura de 10 a 14 días para asegurar la mejor recuperación.' },
      { q: '¿Cuántas sesiones de drenaje linfático necesito?', a: 'Se recomiendan entre 8 y 12 sesiones distribuidas en las primeras semanas para eliminar líquidos y reducir el edema.' },
      { q: '¿Cuándo puedo retomar mis actividades?', a: 'La mayoría de los pacientes pueden retomar sus actividades diarias ligeras en una semana.' },
    ],
    quote: 'La paciencia y la disciplina en tus cuidados son las claves de resultados extraordinarios.',
    linkedUid: null,
    photos: [],
    onboardingDone: false,
    createdBy: 'REEMPLAZAR_CON_UID_DOCTOR',
    createdAt: serverTimestamp(),
  },
  {
    name: 'Camila Ríos',
    email: 'REEMPLAZAR_CON_EMAIL_REAL_DE_CAMILA@gmail.com',
    procedure: 'DRAWNFACE (Marcación Mandibular)',
    stage: 'Día 5 - Asentamiento',
    priority: 'green',
    nextControl: new Date('2026-05-22T12:00:00'),
    pendingAppointment: null,
    currentMilestone: 1,
    milestones: [
      { day: 'Día 1', title: 'Procedimiento', desc: 'Definición del ángulo mandibular.', completed: true },
      { day: 'Día 3-7', title: 'Desinflamación', desc: 'Disminución del edema inicial.', completed: false },
      { day: 'Mes 1', title: 'Efecto Tensor', desc: 'Producción de colágeno y efecto tensor visible.', completed: false },
      { day: 'Mes 3', title: 'Resultado Final', desc: 'Perfil completamente definido y armónico.', completed: false },
    ],
    faqs: [
      { q: '¿Es normal sentir tensión en el cuello?', a: 'Sí, es completamente normal sentir una leve tensión durante los primeros días mientras el tejido se adapta a la estimulación láser.' },
      { q: '¿Cuándo veré el resultado definitivo?', a: 'El resultado definitivo del perfilamiento se aprecia hacia el tercer mes por la producción de colágeno.' },
    ],
    quote: 'Descubre cómo un perfil definido puede potenciar tu confianza.',
    linkedUid: null,
    photos: [],
    onboardingDone: false,
    createdBy: 'REEMPLAZAR_CON_UID_DOCTOR',
    createdAt: serverTimestamp(),
  },
  {
    name: 'Sofía Araneda',
    email: 'REEMPLAZAR_CON_EMAIL_REAL_DE_SOFIA@gmail.com',
    procedure: 'Armonización Facial Completa',
    stage: 'Día 1 - Inflamación Inicial',
    priority: 'red',
    nextControl: new Date('2026-05-18T12:00:00'),
    pendingAppointment: 'Control Primeras 48 Hrs',
    currentMilestone: 0,
    milestones: [
      { day: 'Día 1', title: 'Aplicación', desc: 'Relleno de ojeras o pómulos. Inflamación.', completed: true },
      { day: 'Día 3', title: 'Baja Edema', desc: 'Reducción de hinchazón o posibles hematomas.', completed: false },
      { day: 'Semana 2', title: 'Asentamiento', desc: 'El ácido hialurónico se integra al tejido.', completed: false },
      { day: 'Mes 12', title: 'Re-evaluación', desc: 'El producto comienza a reabsorberse.', completed: false },
    ],
    faqs: [
      { q: '¿Puedo hacer ejercicio hoy?', a: 'Se recomienda evitar el ejercicio intenso, saunas y exposición solar directa durante las primeras 48 horas.' },
      { q: 'Apareció un pequeño moretón, ¿es normal?', a: 'Sí, al ser un procedimiento inyectable pueden surgir pequeños hematomas que desaparecerán en 3 a 5 días.' },
    ],
    quote: 'Armonía, volumen y luz para tu rostro.',
    linkedUid: null,
    photos: [],
    onboardingDone: false,
    createdBy: 'REEMPLAZAR_CON_UID_DOCTOR',
    createdAt: serverTimestamp(),
  },
]

async function seed() {
  console.log('Seeding patients...')
  for (const p of patients) {
    const ref = await addDoc(collection(db, 'patients'), p)
    console.log(`Created: ${p.name} → ${ref.id}`)
  }
  console.log('Done. Now replace linkedUid values in Firebase console as patients log in.')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
