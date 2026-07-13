/* Hunza Care — Portal de seguimiento postoperatorio (modo demo)
 *
 * Aplicación estática sin backend: los datos viven en DEMO_PATIENTS y los
 * cambios de triaje persisten en localStorage. Ver README.md para el guion
 * de demo y las limitaciones conocidas (sin autenticación real).
 */
(function () {
    'use strict';

    // --- CONSTANTES ---
    const WHATSAPP_NUMBER = '56958049193';
    const STORAGE_KEY = 'hunza_priorities_v1';
    const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const MESES_CORTOS = MESES.map(m => m.slice(0, 3));

    // Única fuente de verdad del semáforo: etiqueta, orden y clases de color.
    const PRIORITY = {
        red:    { label: 'Atención urgente', btnLabel: 'como atención urgente', weight: 1, dot: 'bg-red-500',     text: 'text-red-600',     card: 'border-red-200 shadow-red-100' },
        yellow: { label: 'Observación',      btnLabel: 'en observación',        weight: 2, dot: 'bg-amber-400',   text: 'text-amber-700',   card: 'border-amber-200' },
        green:  { label: 'Estable',          btnLabel: 'como estable',          weight: 3, dot: 'bg-emerald-500', text: 'text-emerald-700', card: 'border-stone-100' },
    };

    // Fecha de control relativa a hoy, para que la demo nunca muestre fechas vencidas.
    function controlDate(daysFromNow) {
        const d = new Date(Date.now() + daysFromNow * 86400000);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    // --- DATOS SEMILLA (DEMO) ---
    const DEMO_PATIENTS = [
        {
            id: 1,
            name: 'Valentina Soto',
            procedure: 'Liposucción Láser Ambulatoria',
            stage: 'Semana 2 - Kinesiología Postoperatoria',
            priority: 'yellow',
            nextControl: controlDate(9),
            pendingAppointment: 'Sesión de Drenaje Linfático (Semana 2)',
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
        },
        {
            id: 2,
            name: 'Camila Ríos',
            procedure: 'DRAWNFACE (Marcación Mandibular)',
            stage: 'Día 5 - Asentamiento',
            priority: 'green',
            nextControl: controlDate(3),
            pendingAppointment: null,
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
        },
        {
            id: 3,
            name: 'Sofía Araneda',
            procedure: 'Armonización Facial Completa',
            stage: 'Día 1 - Inflamación Inicial',
            priority: 'red',
            nextControl: controlDate(1),
            pendingAppointment: 'Control Primeras 48 Hrs',
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
        },
    ];

    // --- ESTADO ---
    let view = 'login';
    let selectedPatientId = null;
    let chartInstance = null;
    let chartFilters = { period: 'mensual', month: String(new Date().getMonth() + 1) };
    let patientsData = loadPatients();

    // --- PERSISTENCIA (localStorage) ---
    function loadPatients() {
        const patients = DEMO_PATIENTS.map(p => ({ ...p }));
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            patients.forEach(p => {
                if (saved[p.id] && ['red', 'yellow', 'green'].includes(saved[p.id])) {
                    p.priority = saved[p.id];
                }
            });
        } catch (e) { /* localStorage corrupto o bloqueado: se usan los valores semilla */ }
        return patients;
    }

    function savePriorities() {
        try {
            const map = {};
            patientsData.forEach(p => { map[p.id] = p.priority; });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        } catch (e) { /* modo incógnito o storage lleno: la demo sigue en memoria */ }
    }

    function resetDemo() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* sin storage no hay nada que borrar */ }
        patientsData = loadPatients();
        view = 'login';
        selectedPatientId = null;
        render();
    }

    // --- UTILIDADES ---
    // Escapa datos antes de interpolarlos en innerHTML. Hoy los datos son
    // semilla local, pero este es el único punto de entrada al DOM: cuando
    // lleguen datos de un backend, ya pasan por aquí.
    function esc(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function sortPatients() {
        patientsData.sort((a, b) => PRIORITY[a.priority].weight - PRIORITY[b.priority].weight);
    }

    function waLink(message) {
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }

    function closeButtonHTML(icon, label) {
        return `<button onclick="HunzaApp.setView('login')" aria-label="${label}" class="text-stone-500 hover:text-stone-700 transition p-2 bg-stone-50 rounded-full">
            <i data-lucide="${icon}" class="w-5 h-5"></i>
        </button>`;
    }

    // --- ACCIONES ---
    function setView(newView) {
        view = newView;
        render();
    }

    function loginAsPatient(id) {
        selectedPatientId = id;
        setView('patient');
    }

    function setPriority(patientId, newPriority) {
        const patient = patientsData.find(p => p.id === patientId);
        if (!patient) return;
        patient.priority = newPriority;
        savePriorities();

        // En el dashboard solo cambian las tarjetas y los contadores: se
        // actualizan en sitio para no destruir/recrear el gráfico en cada click.
        const list = document.getElementById('patientList');
        const stats = document.getElementById('statsTiles');
        if (view === 'doctor' && list && stats) {
            sortPatients();
            list.innerHTML = patientsData.map(getPatientCardHTML).join('');
            stats.innerHTML = getStatsHTML();
            if (window.lucide) lucide.createIcons();
        } else {
            render();
        }
    }

    function toggleFAQ(button) {
        const content = button.nextElementSibling;
        const icon = button.querySelector('svg');
        const nowHidden = content.classList.toggle('hidden');
        button.setAttribute('aria-expanded', String(!nowHidden));
        if (icon) icon.style.transform = nowHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    }

    function handleFilterChange() {
        const monthSelect = document.getElementById('monthFilter');
        chartFilters.period = document.getElementById('periodFilter').value;
        chartFilters.month = monthSelect.value;

        const anual = chartFilters.period === 'anual';
        monthSelect.disabled = anual;
        monthSelect.classList.toggle('opacity-40', anual);
        monthSelect.classList.toggle('cursor-not-allowed', anual);
        initChart();
    }

    // --- GRÁFICO (Chart.js) ---
    // Los datos históricos son de demostración (estables, sin aleatoriedad) y
    // el panel lo indica con un badge. Conectarlo a datos reales de agenda es
    // una decisión de producto pendiente (ver AUDITORIA.md, T4/T7).
    function initChart() {
        const ctx = document.getElementById('proceduresChart');
        if (!ctx) return;

        if (typeof Chart === 'undefined') {
            ctx.parentElement.innerHTML = '<p class="text-sm text-stone-500 text-center pt-16">Gráfico no disponible (librería no cargada).</p>';
            return;
        }

        if (chartInstance) chartInstance.destroy();

        let labels = [];
        let data = [];
        let chartTitle = '';

        if (chartFilters.period === 'anual') {
            labels = MESES_CORTOS;
            data = [120, 140, 115, 160, 185, 170, 200, 220, 190, 210, 250, 280];
            chartTitle = 'Total Procedimientos Anuales';
        } else if (chartFilters.period === 'mensual') {
            labels = ['Lipo Láser', 'Drawn Face', 'Armonización', 'Toxina B.', 'Lipomarcación'];
            data = [45, 25, 30, 50, 15];
            chartTitle = `Procedimientos en ${MESES[parseInt(chartFilters.month, 10) - 1]}`;
        } else {
            labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            data = [8, 5, 12, 10, 16, 7];
            chartTitle = `Flujo Diario (Semana Actual, ${MESES[parseInt(chartFilters.month, 10) - 1]})`;
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: chartTitle,
                    data,
                    backgroundColor: '#57534e',
                    borderRadius: chartFilters.period === 'anual' ? 4 : 6,
                    barThickness: chartFilters.period === 'anual' ? 12 : 24,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 500, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${context.parsed.y} procedimientos`,
                        },
                    },
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f5f5f4' }, border: { display: false, dash: [4, 4] } },
                    x: { grid: { display: false }, border: { display: false } },
                },
            },
        });
    }

    // --- RENDER ---
    function render() {
        const app = document.getElementById('app');
        if (view === 'patient' && !patientsData.some(p => p.id === selectedPatientId)) {
            view = 'login';
            selectedPatientId = null;
        }

        if (view === 'doctor') app.innerHTML = getDoctorHTML();
        else if (view === 'patient') app.innerHTML = getPatientHTML();
        else app.innerHTML = getLoginHTML();

        if (window.lucide) lucide.createIcons();
        if (view === 'doctor') initChart();
    }

    // 1. Pantalla de inicio
    function getLoginHTML() {
        return `
        <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 relative overflow-hidden">
            <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-stone-700/30 blur-3xl" aria-hidden="true"></div>
            <div class="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-stone-600/20 blur-3xl" aria-hidden="true"></div>

            <div class="relative bg-white/95 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-stone-100">
                <h1 class="text-3xl font-serif text-stone-800 mb-1">Hunza Care</h1>
                <p class="text-stone-500 mb-8 text-sm">Portal de Seguimiento Clínico</p>

                <div class="space-y-4">
                    <button onclick="HunzaApp.setView('doctor')" class="w-full py-3.5 px-4 bg-stone-800 text-white rounded-2xl hover:bg-stone-700 transition flex items-center justify-center gap-2 font-medium shadow-md">
                        <i data-lucide="line-chart" class="w-5 h-5"></i> Dashboard Dra. Macarena
                    </button>

                    <div class="relative py-4">
                        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-stone-200"></div></div>
                        <div class="relative flex justify-center text-xs"><span class="bg-white px-3 text-stone-500">Acceso Pacientes</span></div>
                    </div>

                    <div class="grid grid-cols-1 gap-2.5">
                        ${patientsData.map(p => `
                            <button onclick="HunzaApp.loginAsPatient(${p.id})" class="w-full py-3 px-4 bg-stone-50 text-stone-700 rounded-2xl hover:bg-stone-100 border border-stone-200 transition text-sm flex items-center justify-between font-medium">
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full ${PRIORITY[p.priority].dot}" aria-hidden="true"></div>
                                    <span>${esc(p.name)}</span>
                                </div>
                                <i data-lucide="chevron-right" class="w-4 h-4 text-stone-500"></i>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span class="inline-flex items-center gap-1"><i data-lucide="flask-conical" class="w-3 h-3"></i> Modo demostración</span>
                    <button onclick="HunzaApp.resetDemo()" class="underline hover:text-stone-700 transition">Reiniciar demo</button>
                </div>
            </div>
        </div>`;
    }

    // 2. Dashboard de la doctora
    function getStatsHTML() {
        const total = patientsData.length;
        const alertas = patientsData.filter(p => p.priority === 'red').length;
        return `
            <div class="bg-white p-5 rounded-3xl shadow-sm border border-stone-100">
                <p class="text-xs text-stone-500 font-medium mb-1">Total Activos</p>
                <p class="text-3xl font-serif text-stone-800">${total}</p>
            </div>
            <div class="bg-white p-5 rounded-3xl shadow-sm border ${alertas > 0 ? 'border-red-100 bg-red-50/20' : 'border-stone-100'}">
                <p class="text-xs text-stone-500 font-medium mb-1">Alertas</p>
                <p class="text-3xl font-serif ${alertas > 0 ? 'text-red-600' : 'text-stone-500'}">${alertas}</p>
            </div>`;
    }

    function getPatientCardHTML(p) {
        return `
            <div class="bg-white p-5 rounded-2xl shadow-sm border ${PRIORITY[p.priority].card} flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1.5">
                        <h4 class="font-semibold text-stone-800 text-lg">${esc(p.name)}</h4>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600 uppercase truncate max-w-[200px]">${esc(p.procedure)}</span>
                    </div>
                    <p class="text-sm text-stone-600 mb-1 flex items-center gap-1.5 font-medium">
                        <i data-lucide="clock" class="w-4 h-4 text-stone-500"></i> ${esc(p.stage)}
                    </p>
                    <p class="text-xs text-stone-500 flex items-center gap-1.5">
                        <i data-lucide="calendar" class="w-4 h-4"></i> Próx. Control: ${esc(p.nextControl)}
                        <span class="text-stone-300" aria-hidden="true">·</span>
                        <span class="font-medium ${PRIORITY[p.priority].text}">${PRIORITY[p.priority].label}</span>
                    </p>
                </div>

                <div class="flex gap-2 p-1 bg-stone-50 rounded-full border border-stone-200 w-fit" role="group" aria-label="Prioridad de ${esc(p.name)}">
                    ${['green', 'yellow', 'red'].map(k => {
                        const c = PRIORITY[k];
                        const active = p.priority === k;
                        return `
                    <button onclick="HunzaApp.setPriority(${p.id}, '${k}')" aria-label="Marcar a ${esc(p.name)} ${c.btnLabel}" aria-pressed="${active}" class="w-10 h-10 rounded-full transition-all flex items-center justify-center ${active ? `${c.dot} shadow-md scale-110` : 'bg-white hover:bg-stone-200'}">
                        <div class="w-3 h-3 rounded-full ${active ? 'bg-white' : c.dot}" aria-hidden="true"></div>
                    </button>`;
                    }).join('')}
                </div>
            </div>`;
    }

    function getDoctorHTML() {
        sortPatients();
        return `
        <div class="min-h-screen bg-stone-50 pb-20">
            <header class="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
                <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-white shadow-md">
                            <i data-lucide="stethoscope" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h2 class="font-serif font-semibold text-lg leading-tight text-stone-800">Dra. Macarena Gutiérrez</h2>
                            <p class="text-[11px] text-stone-500 uppercase tracking-wider">Directora Médica Hunza</p>
                        </div>
                    </div>
                    ${closeButtonHTML('log-out', 'Cerrar sesión')}
                </div>
            </header>

            <main class="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
                <div class="w-full md:w-1/3 flex flex-col gap-6">
                    <div id="statsTiles" class="grid grid-cols-2 gap-4">${getStatsHTML()}</div>

                    <div class="bg-white p-5 rounded-3xl shadow-sm border border-stone-100">
                        <div class="flex flex-col gap-3 mb-5">
                            <div class="flex items-center justify-between">
                                <h3 class="font-serif text-lg text-stone-800 flex items-center gap-2">
                                    <i data-lucide="bar-chart-3" class="w-5 h-5 text-stone-400"></i> Análisis Clínico
                                </h3>
                                <span class="text-[10px] font-semibold uppercase tracking-wide bg-stone-100 text-stone-500 px-2 py-1 rounded-full" title="Datos ilustrativos, no conectados a la agenda real">Datos de demostración</span>
                            </div>

                            <div class="flex gap-2 w-full">
                                <select id="periodFilter" onchange="HunzaApp.handleFilterChange()" aria-label="Periodo del gráfico" class="w-1/2 text-sm border border-stone-200 rounded-xl bg-stone-50 px-3 py-2 text-stone-700 font-medium focus:ring-2 focus:ring-stone-200 outline-none transition-all">
                                    <option value="semanal" ${chartFilters.period === 'semanal' ? 'selected' : ''}>Semanal</option>
                                    <option value="mensual" ${chartFilters.period === 'mensual' ? 'selected' : ''}>Mensual</option>
                                    <option value="anual" ${chartFilters.period === 'anual' ? 'selected' : ''}>Anual</option>
                                </select>
                                <select id="monthFilter" onchange="HunzaApp.handleFilterChange()" aria-label="Mes del gráfico" class="w-1/2 text-sm border border-stone-200 rounded-xl bg-stone-50 px-3 py-2 text-stone-700 font-medium focus:ring-2 focus:ring-stone-200 outline-none transition-all ${chartFilters.period === 'anual' ? 'opacity-40 cursor-not-allowed' : ''}" ${chartFilters.period === 'anual' ? 'disabled' : ''}>
                                    ${MESES.map((mes, idx) => `
                                        <option value="${idx + 1}" ${parseInt(chartFilters.month, 10) === idx + 1 ? 'selected' : ''}>${mes}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="h-56 w-full">
                            <canvas id="proceduresChart" role="img" aria-label="Gráfico de procedimientos (datos de demostración)"></canvas>
                        </div>
                    </div>
                </div>

                <div class="w-full md:w-2/3">
                    <h3 class="font-serif text-xl text-stone-800 mb-4 px-1">Seguimiento por Semáforo</h3>

                    <div id="patientList" class="space-y-3">
                        ${patientsData.length === 0 ? `
                            <div class="bg-white p-10 rounded-2xl border border-dashed border-stone-200 text-center text-stone-500 text-sm">
                                No hay pacientes activos. <button onclick="HunzaApp.resetDemo()" class="underline">Reiniciar demo</button>
                            </div>
                        ` : patientsData.map(getPatientCardHTML).join('')}
                    </div>
                </div>
            </main>
        </div>`;
    }

    // 3. Vista de la paciente (render() garantiza que la paciente existe)
    function getPatientHTML() {
        const p = patientsData.find(pat => pat.id === selectedPatientId);

        const waGeneralLink = waLink(`Hola Clínica Hunza, soy ${p.name}. Tengo una consulta general sobre mi postoperatorio de ${p.procedure}.`);

        let appointmentHTML = '';
        if (p.pendingAppointment) {
            const waApptLink = waLink(`Hola Clínica Hunza, soy ${p.name}. Me gustaría agendar mi cita para: ${p.pendingAppointment}.`);
            appointmentHTML = `
            <div class="bg-blue-50 border border-blue-100 p-5 rounded-3xl relative overflow-hidden mb-2">
                <div class="absolute -right-4 -top-4 opacity-10 text-blue-500" aria-hidden="true">
                    <i data-lucide="calendar-clock" class="w-32 h-32"></i>
                </div>
                <div class="relative z-10">
                    <div class="flex items-center gap-2 text-blue-600 mb-2 font-semibold text-sm uppercase tracking-wide">
                        <i data-lucide="bell-ring" class="w-4 h-4"></i> Cita Pendiente
                    </div>
                    <h3 class="font-serif text-lg text-stone-800 mb-4">${esc(p.pendingAppointment)}</h3>
                    <a href="${waApptLink}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-md shadow-blue-200">
                        Agendar por WhatsApp <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </a>
                </div>
            </div>`;
        }

        return `
        <div class="min-h-screen bg-stone-50 flex flex-col pb-6">
            <header class="bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-stone-100 shadow-sm">
                <div class="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <div class="font-serif font-semibold text-stone-800 tracking-wide text-lg flex items-center gap-2">
                        <i data-lucide="sparkles" class="w-4 h-4 text-stone-400"></i> Hunza Care
                    </div>
                    ${closeButtonHTML('x', 'Salir')}
                </div>
            </header>

            <main class="max-w-md mx-auto w-full flex-1 px-4 py-6 flex flex-col gap-8">
                <div>
                    <p class="text-stone-500 text-sm mb-1 font-medium">Evolución de</p>
                    <h1 class="font-serif text-3xl text-stone-800 mb-4">${esc(p.name)}</h1>

                    <div class="bg-stone-800 text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden">
                        <div class="absolute -right-6 -bottom-6 opacity-10" aria-hidden="true"><i data-lucide="activity" class="w-40 h-40"></i></div>
                        <div class="relative z-10">
                            <p class="text-stone-300 text-[10px] uppercase tracking-widest font-semibold mb-1">Procedimiento</p>
                            <h2 class="text-xl font-serif mb-4 leading-tight">${esc(p.procedure)}</h2>
                            <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium border border-white/10">
                                <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></div>
                                ${esc(p.stage)}
                            </div>
                        </div>
                    </div>
                </div>

                ${appointmentHTML}

                <div class="relative">
                    <div class="flex justify-between items-end mb-3 px-1">
                        <h3 class="font-serif text-lg text-stone-800 flex items-center gap-2">
                            <i data-lucide="calendar-check" class="w-5 h-5 text-stone-400"></i> Línea de Tiempo
                        </h3>
                    </div>

                    <div class="flex overflow-x-auto gap-4 pb-4 px-1 no-scrollbar snap-x cursor-grab active:cursor-grabbing">
                        ${p.milestones.map((m, idx) => `
                            <div class="snap-center shrink-0 w-60 bg-white p-5 rounded-3xl border ${m.completed ? 'border-stone-800 shadow-md' : 'border-stone-200 opacity-70'} relative">
                                ${m.completed ? '<div class="absolute -top-2 -right-2 bg-stone-800 text-white p-1.5 rounded-full shadow-sm"><i data-lucide="check" class="w-3 h-3"></i></div>' : ''}
                                <span class="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">${esc(m.day)}</span>
                                <h4 class="font-serif font-semibold text-stone-800 mb-2 leading-tight">${esc(m.title)}</h4>
                                <p class="text-sm text-stone-500 leading-relaxed">${esc(m.desc)}</p>

                                ${idx < p.milestones.length - 1 ? `<div class="absolute top-1/2 -right-4 w-4 h-[2px] ${m.completed ? 'bg-stone-800' : 'bg-stone-200'}" aria-hidden="true"></div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <p class="text-[10px] text-stone-500 text-center flex items-center justify-center gap-1 mt-1">
                        <i data-lucide="arrow-left-right" class="w-3 h-3"></i> Desliza para ver más
                    </p>
                </div>

                <div>
                    <h3 class="font-serif text-lg text-stone-800 mb-3 px-1 flex items-center gap-2">
                        <i data-lucide="help-circle" class="w-5 h-5 text-stone-400"></i> Cuidados y Dudas
                    </h3>
                    <div class="space-y-2">
                        ${p.faqs.map(faq => `
                            <div class="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                                <button onclick="HunzaApp.toggleFAQ(this)" aria-expanded="false" class="w-full px-5 py-4 text-left flex justify-between items-center bg-white hover:bg-stone-50 transition">
                                    <span class="font-medium text-sm text-stone-800 pr-4">${esc(faq.q)}</span>
                                    <i data-lucide="chevron-down" class="w-4 h-4 text-stone-500 transition-transform duration-300"></i>
                                </button>
                                <div class="hidden px-5 pb-4 text-sm text-stone-500 leading-relaxed border-t border-stone-100 pt-3 bg-stone-50/50">
                                    ${esc(faq.a)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="text-center px-6 py-4 bg-stone-100 rounded-3xl mt-2">
                    <p class="font-serif italic text-stone-600 text-sm">"${esc(p.quote)}"</p>
                </div>

                <a href="${waGeneralLink}" target="_blank" rel="noopener" class="mt-2 w-full bg-white border-2 border-[#25D366] text-[#25D366] p-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-green-50 transition-all active:scale-[0.98] font-semibold">
                    <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Tengo una duda general
                </a>
            </main>
        </div>`;
    }

    // --- API PÚBLICA (handlers de los atributos onclick) ---
    window.HunzaApp = { setView, loginAsPatient, setPriority, toggleFAQ, handleFilterChange, resetDemo };

    // Estado de test: expuesto solo para verificación automatizada de la demo.
    window.__hunzaState = {
        get view() { return view; },
        get patients() { return patientsData; },
        get chart() { return chartInstance; },
    };

    render();
})();
