import { getPatientByEmail, getPatientByUid, linkPatient, completeOnboarding } from '../services/patients.js'
import { refreshIcons } from '../main.js'

let currentPatient = null
let currentUser = null
let logoutFn = null

export async function mountPatient(app, user, onLogout) {
  currentUser = user
  logoutFn = onLogout

  try {
    let patient = await getPatientByUid(user.uid)

    if (!patient) {
      patient = await getPatientByEmail(user.email)

      if (!patient) {
        renderNoAccess(app)
        return
      }

      await linkPatient(patient.id, user.uid)
      patient.linkedUid = user.uid
    }

    currentPatient = patient

    if (!patient.onboardingDone) {
      renderPatient(app)
      renderOnboardingModal(app)
    } else {
      renderPatient(app)
    }
  } catch (err) {
    app.innerHTML = `<div class="min-h-screen flex items-center justify-center p-4"><p class="text-urgent text-sm">Error al cargar tu ficha. Recargá la página.</p></div>`
  }
}

function renderPatient(app) {
  const p = currentPatient
  const waGeneralLink = `https://wa.me/56958049193?text=${encodeURIComponent(`Hola Clínica Hunza, soy ${p.name}. Tengo una consulta sobre mi postoperatorio de ${p.procedure}.`)}`

  let appointmentHTML = ''
  if (p.pendingAppointment) {
    const waApptLink = `https://wa.me/56958049193?text=${encodeURIComponent(`Hola Clínica Hunza, soy ${p.name}. Quiero agendar: ${p.pendingAppointment}.`)}`
    appointmentHTML = `
    <div class="bg-ok-bg border border-ok/20 p-5 rounded-xl relative overflow-hidden mb-2">
      <div class="absolute -right-4 -top-4 opacity-10 text-hunza">
        <i data-lucide="calendar-clock" class="w-32 h-32"></i>
      </div>
      <div class="relative z-10">
        <div class="flex items-center gap-2 text-hunza mb-2 font-semibold text-sm uppercase tracking-wide">
          <i data-lucide="bell-ring" class="w-4 h-4"></i> Cita Pendiente
        </div>
        <h3 class="font-serif text-lg text-carbon mb-4">${p.pendingAppointment}</h3>
        <a href="${waApptLink}" target="_blank" class="inline-flex items-center gap-2 bg-hunza text-white px-5 py-2.5 rounded-3xl text-sm font-medium hover:bg-hunza-dark transition shadow-sm">
          Agendar por WhatsApp <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
      </div>
    </div>`
  }

  const milestones = (p.milestones || []).map((m, idx) => `
    <div class="snap-center shrink-0 w-60 bg-white p-5 rounded-xl border ${m.completed ? 'border-hunza shadow-sm' : 'border-arena/40 opacity-70'} relative">
      ${m.completed ? '<div class="absolute -top-2 -right-2 bg-hunza text-white p-1.5 rounded-full shadow-sm"><i data-lucide="check" class="w-3 h-3"></i></div>' : ''}
      <span class="text-[10px] font-bold text-salvia uppercase tracking-wider mb-1.5 block">${m.day}</span>
      <h4 class="font-serif font-semibold text-carbon mb-2 leading-tight">${m.title}</h4>
      <p class="text-sm text-piedra leading-relaxed">${m.desc}</p>
      ${idx < p.milestones.length - 1 ? `<div class="absolute top-1/2 -right-4 w-4 h-[2px] ${m.completed ? 'bg-hunza' : 'bg-arena/40'}"></div>` : ''}
    </div>`).join('')

  const faqs = (p.faqs || []).map(faq => `
    <div class="bg-white border border-arena/40 rounded-xl overflow-hidden">
      <button class="faq-toggle w-full px-5 py-4 text-left flex justify-between items-center bg-white hover:bg-lino transition">
        <span class="font-medium text-sm text-carbon pr-4">${faq.q}</span>
        <i data-lucide="chevron-down" class="w-4 h-4 text-salvia transition-transform duration-300"></i>
      </button>
      <div class="hidden px-5 pb-4 text-sm text-piedra leading-relaxed border-t border-arena/30 pt-3 bg-lino/50">${faq.a}</div>
    </div>`).join('')

  app.innerHTML = `
  <div id="patient-view" class="min-h-screen bg-lino flex flex-col pb-6">
    <header class="bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-arena/30 shadow-sm">
      <div class="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div class="font-serif font-semibold text-carbon tracking-wide text-lg flex items-center gap-2">
          <i data-lucide="sparkles" class="w-4 h-4 text-salvia"></i> Hunza Care
        </div>
        <button id="btn-logout" class="text-salvia hover:text-carbon transition p-2 bg-lino rounded-full">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
    </header>

    <main class="max-w-md mx-auto w-full flex-1 px-4 py-6 flex flex-col gap-8">
      <div>
        <p class="text-piedra text-sm mb-1 font-medium">Evolución de</p>
        <h1 class="font-serif text-3xl text-carbon mb-4">${p.name}</h1>
        <div class="bg-hunza text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
          <div class="absolute -right-6 -bottom-6 opacity-10"><i data-lucide="activity" class="w-40 h-40"></i></div>
          <div class="relative z-10">
            <p class="text-salvia/70 text-[10px] uppercase tracking-widest font-semibold mb-1">Procedimiento</p>
            <h2 class="text-xl font-serif mb-4 leading-tight">${p.procedure}</h2>
            <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium border border-white/10">
              <div class="w-2 h-2 rounded-full bg-ok animate-pulse"></div>
              ${p.stage}
            </div>
          </div>
        </div>
      </div>

      ${appointmentHTML}

      <div class="relative">
        <div class="flex justify-between items-end mb-3 px-1">
          <h3 class="font-serif text-lg text-carbon flex items-center gap-2">
            <i data-lucide="calendar-check" class="w-5 h-5 text-salvia"></i> Línea de Tiempo
          </h3>
        </div>
        <div class="flex overflow-x-auto gap-4 pb-4 px-1 no-scrollbar snap-x cursor-grab active:cursor-grabbing">
          ${milestones || '<p class="text-salvia text-sm">Sin hitos cargados aún.</p>'}
        </div>
        <p class="text-[10px] text-salvia text-center flex items-center justify-center gap-1 mt-1">
          <i data-lucide="arrow-left-right" class="w-3 h-3"></i> Desliza para ver más
        </p>
      </div>

      <div>
        <h3 class="font-serif text-lg text-carbon mb-3 px-1 flex items-center gap-2">
          <i data-lucide="help-circle" class="w-5 h-5 text-salvia"></i> Cuidados y Dudas
        </h3>
        <div class="space-y-2">${faqs || '<p class="text-salvia text-sm">Sin preguntas cargadas aún.</p>'}</div>
      </div>

      ${p.quote ? `<div class="text-center px-6 py-4 bg-white border border-arena/40 rounded-xl mt-2">
        <p class="font-serif italic text-piedra text-sm">"${p.quote}"</p>
      </div>` : ''}

      <a href="${waGeneralLink}" target="_blank" class="mt-2 w-full bg-white border-2 border-[#25D366] text-[#25D366] p-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-ok-bg/50 transition-all active:scale-[0.98] font-semibold">
        <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        Tengo una duda general
      </a>
    </main>
  </div>`

  document.getElementById('btn-logout').addEventListener('click', logoutFn)

  document.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling
      const icon = btn.querySelector('svg')
      content.classList.toggle('hidden')
      if (icon) icon.style.transform = content.classList.contains('hidden') ? '' : 'rotate(180deg)'
    })
  })

  refreshIcons()
}

function renderOnboardingModal(app) {
  const modal = document.createElement('div')
  modal.id = 'onboarding-modal'
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/70 backdrop-blur-sm'
  modal.innerHTML = `
  <div class="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-lg border border-arena/30">
    <div class="w-14 h-14 bg-lino rounded-full mx-auto mb-5 flex items-center justify-center">
      <i data-lucide="sparkles" class="w-7 h-7 text-hunza"></i>
    </div>
    <p class="text-xs text-salvia uppercase tracking-widest font-semibold mb-2">Bienvenida a</p>
    <h2 class="font-serif text-2xl text-carbon mb-4">Hunza Care</h2>
    <p class="text-piedra text-sm leading-relaxed mb-6">
      Esta es tu app de seguimiento post-operatorio. Aquí vas a ver tu evolución, tus próximas citas y tus cuidados.<br><br>
      <strong class="text-carbon">La Dra. Macarena ya cargó tu ficha.</strong>
    </p>
    <button id="btn-onboarding-done" class="w-full bg-hunza text-white py-3.5 rounded-3xl font-semibold hover:bg-hunza-dark transition">
      Entendido, ver mi ficha →
    </button>
    <p class="text-xs text-salvia mt-3">Este mensaje no volverá a aparecer</p>
  </div>`

  app.appendChild(modal)
  refreshIcons()

  document.getElementById('btn-onboarding-done').addEventListener('click', async () => {
    await completeOnboarding(currentPatient.id)
    currentPatient.onboardingDone = true
    modal.remove()
  })
}

function renderNoAccess(app) {
  app.innerHTML = `
  <div class="min-h-screen flex items-center justify-center p-4 bg-lino">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-arena/40 max-w-sm w-full text-center">
      <i data-lucide="shield-x" class="w-10 h-10 text-salvia mx-auto mb-4"></i>
      <h2 class="font-serif text-xl text-carbon mb-2">Sin acceso</h2>
      <p class="text-piedra text-sm mb-6">Tu cuenta no está registrada en Hunza Care. Contactá a la clínica para que la Dra. Macarena te agregue.</p>
      <button id="btn-logout-noaccess" class="w-full py-3 bg-lino text-carbon border border-arena/40 rounded-xl text-sm font-medium hover:bg-arena/20 transition">
        Cerrar sesión
      </button>
    </div>
  </div>`
  refreshIcons()
  document.getElementById('btn-logout-noaccess').addEventListener('click', logoutFn)
}
