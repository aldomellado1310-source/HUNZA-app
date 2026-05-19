import { getAllPatients, setPriority, createPatient } from '../services/patients.js'
import { initChart } from '../components/chart.js'
import { refreshIcons } from '../main.js'

const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

let chartFilters = { period: 'mensual', month: String(new Date().getMonth() + 1) }
let patients = []
let currentUser = null
let logoutFn = null
let showingForm = false

export async function mountDoctor(app, user, onLogout) {
  currentUser = user
  logoutFn = onLogout
  showingForm = false
  patients = await getAllPatients(user.uid, 'doctor')
  renderDoctor(app)
}

function renderDoctor(app) {
  const sorted = [...patients].sort((a, b) => {
    const w = { red: 1, yellow: 2, green: 3 }
    return (w[a.priority] ?? 4) - (w[b.priority] ?? 4)
  })
  const total = sorted.length
  const alertas = sorted.filter(p => p.priority === 'red').length

  app.innerHTML = `
  <div class="min-h-screen bg-lino pb-20">
    <header class="bg-white border-b border-arena/40 sticky top-0 z-20 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-hunza flex items-center justify-center text-white shadow-sm">
            <i data-lucide="stethoscope" class="w-5 h-5"></i>
          </div>
          <div>
            <h2 class="font-serif font-semibold text-lg leading-tight text-carbon">Dra. Macarena Gutiérrez</h2>
            <p class="text-[11px] text-piedra uppercase tracking-wider">Directora Médica Hunza</p>
          </div>
        </div>
        <button id="btn-logout" class="text-salvia hover:text-carbon transition p-2 bg-lino rounded-full">
          <i data-lucide="log-out" class="w-5 h-5"></i>
        </button>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <div class="w-full md:w-1/3 flex flex-col gap-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white p-5 rounded-xl shadow-sm border border-arena/40">
            <p class="text-xs text-piedra font-medium mb-1">Total Activos</p>
            <p class="text-3xl font-serif text-carbon">${total}</p>
          </div>
          <div class="bg-white p-5 rounded-xl shadow-sm border ${alertas > 0 ? 'border-urgent/30 bg-urgent-bg/20' : 'border-arena/40'}">
            <p class="text-xs text-piedra font-medium mb-1">Alertas</p>
            <p class="text-3xl font-serif ${alertas > 0 ? 'text-urgent' : 'text-salvia'}">${alertas}</p>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-arena/40">
          <div class="flex flex-col gap-3 mb-5">
            <h3 class="font-serif text-lg text-carbon flex items-center gap-2">
              <i data-lucide="bar-chart-3" class="w-5 h-5 text-salvia"></i> Análisis Clínico
            </h3>
            <div class="flex gap-2 w-full">
              <select id="periodFilter" class="w-1/2 text-sm border border-arena/60 rounded-lg bg-lino px-3 py-2 text-carbon font-medium focus:ring-2 focus:ring-salvia/40 outline-none">
                ${['semanal','mensual','anual'].map(v => `<option value="${v}" ${chartFilters.period === v ? 'selected' : ''}>${v.charAt(0).toUpperCase() + v.slice(1)}</option>`).join('')}
              </select>
              <select id="monthFilter" class="w-1/2 text-sm border border-arena/60 rounded-lg bg-lino px-3 py-2 text-carbon font-medium focus:ring-2 focus:ring-salvia/40 outline-none ${chartFilters.period === 'anual' ? 'opacity-40 cursor-not-allowed' : ''}" ${chartFilters.period === 'anual' ? 'disabled' : ''}>
                ${mesesNombres.map((m, i) => `<option value="${i+1}" ${parseInt(chartFilters.month) === i+1 ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="h-56 w-full"><canvas id="proceduresChart"></canvas></div>
        </div>
      </div>

      <div class="w-full md:w-2/3">
        <div class="flex items-center justify-between mb-4 px-1">
          <h3 class="font-serif text-xl text-carbon">Seguimiento por Semáforo</h3>
          <button id="btn-nueva-paciente" class="flex items-center gap-2 bg-hunza text-white text-sm px-4 py-2 rounded-xl hover:bg-hunza-dark transition font-medium">
            <i data-lucide="user-plus" class="w-4 h-4"></i> Nueva Paciente
          </button>
        </div>

        ${showingForm ? getAddPatientFormHTML() : ''}

        <div class="space-y-3" id="patients-list">
          ${sorted.map(p => getPatientCardHTML(p)).join('')}
        </div>
      </div>
    </main>
  </div>`

  document.getElementById('btn-logout').addEventListener('click', logoutFn)
  document.getElementById('btn-nueva-paciente').addEventListener('click', () => {
    showingForm = !showingForm
    renderDoctor(app)
    refreshIcons()
  })

  if (showingForm) wireAddPatientForm(app)

  sorted.forEach(p => {
    ['green','yellow','red'].forEach(color => {
      const btn = document.getElementById(`priority-${p.id}-${color}`)
      if (btn) btn.addEventListener('click', () => handleSetPriority(app, p.id, color))
    })
  })

  document.getElementById('periodFilter').addEventListener('change', e => {
    chartFilters.period = e.target.value
    renderDoctor(app)
    refreshIcons()
  })
  document.getElementById('monthFilter').addEventListener('change', e => {
    chartFilters.month = e.target.value
    initChart(chartFilters)
  })

  setTimeout(() => initChart(chartFilters), 50)
}

function getPatientCardHTML(p) {
  const borderClass = p.priority === 'red'
    ? 'border-urgent/30 shadow-urgent/5'
    : p.priority === 'yellow'
    ? 'border-alert/30'
    : 'border-arena/40'

  return `
  <div class="bg-white p-5 rounded-xl shadow-sm border ${borderClass} flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
    <div class="flex-1">
      <div class="flex items-center gap-2 mb-1.5">
        <h4 class="font-semibold text-carbon text-lg">${p.name}</h4>
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-lino text-piedra uppercase truncate max-w-[200px]">${p.procedure}</span>
      </div>
      <p class="text-sm text-carbon mb-1 flex items-center gap-1.5 font-medium">
        <i data-lucide="clock" class="w-4 h-4 text-salvia"></i> ${p.stage}
      </p>
      <p class="text-xs text-piedra flex items-center gap-1.5">
        <i data-lucide="calendar" class="w-4 h-4"></i> Próx. Control: ${formatDate(p.nextControl)}
      </p>
    </div>
    <div class="flex gap-2 p-1 bg-lino rounded-full border border-arena/40 w-fit">
      ${['green','yellow','red'].map(color => {
        const isActive = p.priority === color
        const activeBg = color === 'green' ? 'bg-ok' : color === 'yellow' ? 'bg-alert' : 'bg-urgent'
        const dotColor = color === 'green' ? 'bg-ok' : color === 'yellow' ? 'bg-alert' : 'bg-urgent'
        return `
        <button id="priority-${p.id}-${color}" class="w-10 h-10 rounded-full transition-all flex items-center justify-center ${isActive ? `${activeBg} shadow-sm scale-110` : 'bg-white hover:bg-salvia/20'}">
          <div class="w-3 h-3 rounded-full ${isActive ? 'bg-white' : dotColor}"></div>
        </button>`
      }).join('')}
    </div>
  </div>`
}

function getAddPatientFormHTML() {
  return `
  <div id="add-patient-form" class="bg-white border border-arena/40 rounded-xl p-5 mb-4 shadow-sm">
    <h4 class="font-serif text-lg text-carbon mb-4">Nueva Paciente</h4>
    <div class="grid grid-cols-1 gap-3">
      <input id="f-name" type="text" placeholder="Nombre completo" class="w-full border border-arena/60 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-salvia/40" required>
      <input id="f-email" type="email" placeholder="Email Gmail (para login)" class="w-full border border-arena/60 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-salvia/40" required>
      <input id="f-procedure" type="text" placeholder="Procedimiento" class="w-full border border-arena/60 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-salvia/40" required>
      <input id="f-stage" type="text" placeholder="Etapa actual (ej: Día 1 - Inflamación)" class="w-full border border-arena/60 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-salvia/40" required>
      <div class="grid grid-cols-2 gap-3">
        <select id="f-priority" class="border border-arena/60 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-salvia/40 bg-white text-carbon">
          <option value="green">Verde</option>
          <option value="yellow" selected>Amarillo</option>
          <option value="red">Rojo</option>
        </select>
        <input id="f-nextControl" type="date" class="border border-arena/60 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-salvia/40">
      </div>
    </div>
    <p id="form-error" class="text-urgent text-xs mt-2 hidden"></p>
    <div class="grid grid-cols-2 gap-3 mt-4">
      <button id="btn-cancel-form" class="py-2.5 rounded-xl bg-lino text-piedra text-sm font-medium hover:bg-arena/30 transition">Cancelar</button>
      <button id="btn-save-patient" class="py-2.5 rounded-xl bg-hunza text-white text-sm font-semibold hover:bg-hunza-dark transition">Guardar →</button>
    </div>
  </div>`
}

function wireAddPatientForm(app) {
  document.getElementById('btn-cancel-form').addEventListener('click', () => {
    showingForm = false
    renderDoctor(app)
    refreshIcons()
  })

  document.getElementById('btn-save-patient').addEventListener('click', async () => {
    const name = document.getElementById('f-name').value.trim()
    const email = document.getElementById('f-email').value.trim()
    const procedure = document.getElementById('f-procedure').value.trim()
    const stage = document.getElementById('f-stage').value.trim()
    const priority = document.getElementById('f-priority').value
    const nextControlRaw = document.getElementById('f-nextControl').value

    const errEl = document.getElementById('form-error')

    if (!name || !email || !procedure || !stage) {
      errEl.textContent = 'Nombre, email, procedimiento y etapa son obligatorios.'
      errEl.classList.remove('hidden')
      return
    }

    errEl.classList.add('hidden')
    document.getElementById('btn-save-patient').textContent = 'Guardando...'
    document.getElementById('btn-save-patient').disabled = true

    try {
      await createPatient({
        name,
        email,
        procedure,
        stage,
        priority,
        nextControl: nextControlRaw ? new Date(nextControlRaw + 'T12:00:00') : null,
        pendingAppointment: null,
        currentMilestone: 0,
        milestones: [],
        faqs: [],
        quote: '',
      }, currentUser.uid)

      patients = await getAllPatients(currentUser.uid, 'doctor')
      showingForm = false
      renderDoctor(app)
      refreshIcons()
    } catch (err) {
      errEl.textContent = 'Error al guardar. Intentá de nuevo.'
      errEl.classList.remove('hidden')
      document.getElementById('btn-save-patient').textContent = 'Guardar →'
      document.getElementById('btn-save-patient').disabled = false
    }
  })
}

async function handleSetPriority(app, patientId, newPriority) {
  try {
    await setPriority(patientId, newPriority, currentUser.uid)
    const idx = patients.findIndex(p => p.id === patientId)
    if (idx !== -1) patients[idx].priority = newPriority
    renderDoctor(app)
    refreshIcons()
  } catch (err) {
    alert('No se pudo actualizar la prioridad. Verificá tu conexión.')
  }
}

function formatDate(val) {
  if (!val) return '—'
  if (val.toDate) return val.toDate().toLocaleDateString('es-CL')
  if (val instanceof Date) return val.toLocaleDateString('es-CL')
  return String(val)
}
