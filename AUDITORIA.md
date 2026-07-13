# Auditoría de Software — HUNZA-app

**Fecha:** 2026-07-13 · **Modo:** único-repo · **Auditor:** agente senior de auditoría
**Objeto:** `CODIGO HUNZA.html` (SPA de un solo archivo, 538 líneas) + `README.md` (vacío).

---

## FASE 0 — Definición de éxito

Hunza Care es un portal de seguimiento postoperatorio para una clínica estética
(Chile, contacto WhatsApp +56 9 5804 9193). Tiene dos caras: (1) la paciente ve su
línea de tiempo de recuperación, citas pendientes y FAQs, lo que aumenta adherencia
al tratamiento y reduce consultas repetitivas; (2) la doctora ve un semáforo de
triaje y analítica de procedimientos para priorizar atención. **El fallo más caro**
es doble: exposición de datos de salud de pacientes (dato sensible bajo la Ley
21.719 de Chile) y decisiones clínicas tomadas sobre información falsa o perdida
(analítica simulada, triaje que no persiste). Toda mejora se pondera contra esos
dos riesgos.

**Estado real del artefacto:** es un prototipo/demo front-only sin backend, sin
auth y con datos hardcodeados. La auditoría lo evalúa como tal, pero señala qué es
bloqueante antes de ponerlo frente a pacientes reales.

---

## FASE 1 — Mapa de arquitectura

```
CODIGO HUNZA.html  (todo el sistema)
├── <head>: 4 dependencias CDN en runtime, sin versión fijada ni SRI
│   ├── cdn.tailwindcss.com          (Tailwind Play CDN — solo para desarrollo)
│   ├── unpkg.com/lucide@latest      (iconos, tag flotante)
│   ├── cdn.jsdelivr.net/npm/chart.js (sin versión)
│   └── fonts.googleapis.com          (@import bloqueante, línea 14)
├── Estado global: view, selectedPatientId, chartInstance, chartFilters (L53–61)
├── Datos: patientsData hardcodeado con 3 pacientes reales-aparentes (L65–132)
├── Lógica: sortPatients, setView, loginAsPatient, setPriority, toggleFAQ,
│           handleFilterChange, initChart (L135–260)
└── Render: innerHTML total por vista — getLoginHTML / getDoctorHTML /
            getPatientHTML (L263–533), iconos vía lucide.createIcons() (L269)
```

- **Stack:** HTML + JS vanilla, sin build, sin package.json, sin tests, sin CI, sin .gitignore.
- **Ruteo:** variable `view` en memoria; no hay URLs ni historial del navegador.
- **Persistencia:** ninguna (ni localStorage ni backend).
- **Flujos:** login (falso) → dashboard doctora (semáforo + gráfico) | vista paciente (timeline + citas + FAQ + WhatsApp).

---

## FASE 2 + 3 — Hallazgos (verificados)

Verificación ejecutada: smoke test con Chromium headless sobre el archivo
(no hay linter/tests/build en el repo que ejecutar). Resultados del test:
dashboard médico accesible sin credenciales ✔; triaje en rojo pasa de 2→1 tras
recargar la página ✔; con CDNs inaccesibles, `lucide is not defined` rompe
setView/setPriority/loginAsPatient ✔; `chartInstance` queda null ✔.
El happy-path con CDNs disponibles se evaluó por lectura de código (el entorno
de auditoría bloquea CDNs), marcado como [inferencia] donde aplica.

| ID | Ubicación | Sev. | Eje | Evidencia | Riesgo | Estado |
|----|-----------|------|-----|-----------|--------|--------|
| H1 | `CODIGO HUNZA.html:282,293` | Crítico | Seguridad | El "login" es solo `setView('doctor')` / `loginAsPatient(id)`; no hay credenciales | Cualquier persona con la URL accede al panel médico y a todas las fichas | [confirmado] |
| H2 | `CODIGO HUNZA.html:65-132` | Crítico | Seguridad/Privacidad | Nombres completos, procedimientos y etapas clínicas hardcodeados en el cliente | Exposición de datos sensibles de salud (Ley 21.719 CL); cada paciente ve los datos de las demás | [confirmado] |
| H3 | `CODIGO HUNZA.html:269` | Crítico | Fiabilidad | `render()` llama `lucide.createIcons()` sin guard; si un CDN falla, TODA la navegación lanza ReferenceError | App inutilizable offline o ante caída/bloqueo de unpkg/jsdelivr/tailwind CDN | [confirmado: smoke test] |
| H4 | `CODIGO HUNZA.html:199-216` | Alto | Correctitud | El gráfico "Análisis Clínico" usa datos inventados escalados por `monthFactor`; no lee `patientsData` | La doctora ve analítica fabricada presentada como real → decisiones sobre datos falsos | [confirmado] |
| H5 | `CODIGO HUNZA.html:153-160` | Alto | Fiabilidad | `setPriority` solo muta el array en memoria; sin localStorage/backend | El triaje (trabajo clínico) se pierde en cada recarga | [confirmado: smoke test 2→1] |
| H6 | `CODIGO HUNZA.html:8,10,12` | Alto | Seguridad | `lucide@latest` y `chart.js` sin versión ni SRI; Tailwind Play CDN es explícitamente no-producción | Supply-chain: un release comprometido o breaking se ejecuta de inmediato en la clínica | [confirmado] |
| H7 | `CODIGO HUNZA.html:265-267,292,380,486,508` | Medio | Seguridad (latente) | Render por `innerHTML` interpolando datos sin escapar | Hoy los datos son estáticos (sin XSS explotable); será XSS almacenado apenas los datos vengan de un backend/formulario | [confirmado el patrón; riesgo latente] |
| H8 | `CODIGO HUNZA.html:74,98,119` | Medio | Correctitud | `currentMilestone` definido y nunca leído; el avance real vive en flags `completed` + string `stage` | Tres fuentes de verdad que pueden divergir; bugs al actualizar el progreso | [confirmado: sin referencias de lectura] |
| H9 | `CODIGO HUNZA.html:144,158` | Medio | Correctitud | `setTimeout(initChart, 50)` como sincronización tras render | Race condition: si el canvas/Chart.js no está listo en 50 ms el gráfico no se dibuja, sin error visible | [confirmado el patrón] |
| H10 | repo raíz | Medio | Mantenibilidad | Un archivo de 538 líneas con espacio en el nombre (`CODIGO HUNZA.html`); sin package.json, lint, tests, CI, .gitignore; README de 1 línea | Todo cambio es arriesgado y no verificable; el nombre con espacio complica URLs y tooling | [confirmado] |
| H11 | `CODIGO HUNZA.html:60,72,96,117` | Medio | Correctitud | Fechas de control hardcodeadas (`28/05/2026`…) y mes por defecto fijo `'5'` | Información clínica obsoleta mostrada como vigente | [confirmado] |
| H12 | `CODIGO HUNZA.html:396-404,510` | Bajo | UX/A11y | Botones de semáforo sin `aria-label` y estado transmitido solo por color; FAQ sin `aria-expanded` | Inusable con lector de pantalla; semáforo ambiguo para daltonismo | [confirmado] |
| H13 | `CODIGO HUNZA.html:14,263-270` | Bajo | Rendimiento | `@import` de fuentes bloqueante; re-render total + destroy/recreate del chart en cada click | Aceptable a esta escala; degradará con más pacientes | [confirmado el patrón] |
| H14 | `CODIGO HUNZA.html:417-418` | Bajo | Correctitud | Si el paciente no existe se pinta el login pero `view` queda `'patient'` | Estado interno inconsistente tras un id inválido | [confirmado por lectura] |
| H15 | `CODIGO HUNZA.html:420,424` | Bajo | Mantenibilidad | Número de WhatsApp real duplicado en dos template strings | Cambio de número requiere tocar 2 sitios; publicar el número es decisión de producto | [confirmado] |

---

## FASE 4 — Priorización (impacto según Fase 0 vs. esfuerzo)

| Cuadrante | Hallazgos |
|---|---|
| **Quick wins** (hacer ya) | H3 (guards + fallback), H6 (fijar versiones + SRI), H5 (persistir triaje en localStorage), H9 (eliminar setTimeout race), H10 parcial (renombrar archivo, README, .gitignore), H12 (aria-labels) |
| **Proyectos** (planificar) | H1+H2 (backend con auth real y datos por sesión — prerequisito absoluto para uso real), H7 (capa de render con escape/DOM seguro), H4 si se quiere analítica real |
| **Rellenos** | H8, H11, H13, H14, H15 |
| **Descartar por ahora** | Migrar a framework (React/Vue): no se justifica hasta que exista backend |

**Top 5 del proyecto (única fuente, también es el top global):**

1. **H3+H6 — Robustecer carga de dependencias.** Sin esto la app muere entera ante cualquier hipo de red de un tercero. Mínimo esfuerzo, elimina el modo de fallo total.
2. **H5 — Persistir el triaje.** El semáforo es EL flujo de valor de la doctora; hoy su trabajo se evapora al recargar. localStorage lo resuelve en el prototipo.
3. **H4 — Sincerar la analítica.** Datos fabricados en un panel clínico son peores que no tener panel: o se rotula "datos de demostración" o se deriva de `patientsData`. ⚠️ *Decisión de producto marcada: no resolver unilateralmente qué métrica real mostrar.*
4. **H1+H2 — Auth + backend antes de cualquier paciente real.** Bloqueante regulatorio y reputacional. Es proyecto, no quick win; decidir stack (p. ej. Firebase/Supabase) es decisión de producto/negocio.
5. **H10 — Higiene mínima de repo** (renombrar a `index.html`, README con instrucciones, .gitignore). Habilita todo lo demás y el trabajo en paralelo de otros agentes.

---

## FASE 5 — Backlog delegable

Tareas atómicas, ejecutables en paralelo salvo dependencia declarada.
Verificación base común: abrir la página con Chromium headless y comprobar que no
hay errores en consola y que las 3 vistas renderizan.

---

### T1 — Fijar versiones y SRI de dependencias CDN
- **Objetivo:** eliminar el riesgo supply-chain de dependencias flotantes.
- **Archivos:** `CODIGO HUNZA.html:7-12`
- **Cambio:** reemplazar `unpkg.com/lucide@latest` y `cdn.jsdelivr.net/npm/chart.js` por URLs con versión exacta (p. ej. `lucide@0.462.0`, `chart.js@4.4.x`) + atributos `integrity` y `crossorigin`. Documentar en README que Tailwind Play CDN es solo para prototipo (o compilar un CSS estático de Tailwind si se quiere cerrar H6 del todo — sin nuevas dependencias de build salvo justificación).
- **Aceptación:** ninguna URL de script sin versión fijada; scripts con SRI válido; la app renderiza igual.
- **Verificación:** smoke test headless: las 3 vistas renderizan, 0 errores de consola con red disponible.
- **Dependencias/riesgo:** ninguna. Riesgo bajo: un hash SRI mal calculado bloquea el script (el smoke test lo detecta).

### T2 — Guard de dependencias y degradación elegante
- **Objetivo:** que un CDN caído no rompa la navegación completa.
- **Archivos:** `CODIGO HUNZA.html:189-193, 263-270`
- **Cambio:** en `render()`, envolver `lucide.createIcons()` en `if (window.lucide) … else` (los iconos se omiten, la app sigue); en `initChart()`, si `typeof Chart === 'undefined'` mostrar un texto "Gráfico no disponible" dentro del contenedor en vez de fallar en silencio.
- **Aceptación:** con los 4 CDNs bloqueados, login → doctor → paciente y el cambio de prioridad funcionan sin excepciones.
- **Verificación:** smoke test headless SIN red: `setView('doctor')`, `setPriority(2,'red')`, `loginAsPatient(1)` ejecutan sin `ReferenceError` (hoy los tres fallan).
- **Dependencias/riesgo:** ninguna. Riesgo mínimo.

### T3 — Persistir estado de triaje en localStorage
- **Objetivo:** que el semáforo asignado por la doctora sobreviva a la recarga.
- **Archivos:** `CODIGO HUNZA.html:65-132, 153-160`
- **Cambio:** al final de `setPriority`, guardar `{id: priority}` en `localStorage('hunza_priorities')`; al inicializar, aplicar sobre `patientsData` las prioridades guardadas (merge por id, con try/catch ante JSON corrupto).
- **Aceptación:** cambiar una prioridad, recargar, y la prioridad persiste; borrar localStorage restaura los valores por defecto.
- **Verificación:** smoke test: `setPriority(2,'red')` → reload → `patientsData.filter(p=>p.priority==='red').length === 2` (hoy da 1).
- **Dependencias/riesgo:** ninguna. Nota: es paliativo de prototipo; la solución real llega con T7.

### T4 — Sincerar el gráfico de análisis clínico
- **Objetivo:** que el panel no presente datos inventados como reales.
- **Archivos:** `CODIGO HUNZA.html:188-260, 347-372`
- **Cambio (opción mínima, sin decidir producto):** añadir badge visible "Datos de demostración" en el panel del gráfico y comentario en código; eliminar el pseudo-aleatorio `monthFactor` para que al menos los datos demo sean estables entre meses.
- **Aceptación:** el badge es visible en la vista doctora; cambiar de mes no altera mágicamente los totales.
- **Criterio de escalado:** qué métrica real mostrar (¿conteo por procedimiento desde `patientsData`? ¿datos de agenda?) es **decisión de producto — no implementar sin confirmación**.
- **Verificación:** captura headless de la vista doctora muestra el badge; diff no toca otras vistas.
- **Dependencias/riesgo:** ninguna.

### T5 — Eliminar la race condition del chart
- **Objetivo:** dibujar el gráfico de forma determinista tras el render.
- **Archivos:** `CODIGO HUNZA.html:140-146, 153-160`
- **Cambio:** reemplazar `setTimeout(initChart, 50)` por una llamada síncrona a `initChart()` inmediatamente después de `render()` (el canvas ya existe en el DOM tras asignar innerHTML), o por `requestAnimationFrame(initChart)`.
- **Aceptación:** no queda ningún `setTimeout` de sincronización; el gráfico aparece siempre al entrar a la vista doctora.
- **Verificación:** smoke test con red: `chartInstance !== null` tras `setView('doctor')` sin esperas artificiales.
- **Dependencias/riesgo:** hacer después de T2 (comparten `initChart`).

### T6 — Higiene de repo
- **Objetivo:** repo operable por humanos y agentes.
- **Archivos:** `CODIGO HUNZA.html` → `index.html`; `README.md`; nuevo `.gitignore`.
- **Cambio:** `git mv "CODIGO HUNZA.html" index.html`; README con: qué es la app, cómo abrirla, estado (prototipo, datos demo), estructura y limitaciones conocidas (sin auth, sin backend); .gitignore básico (node_modules, .DS_Store).
- **Aceptación:** no existe archivo con espacio en el nombre; README responde qué/cómo/estado.
- **Verificación:** `git ls-files` sin espacios; la página abre desde `index.html`.
- **Dependencias/riesgo:** coordinar con T1–T5 (cambia la ruta del archivo que todos editan) — ejecutar T6 al final o primero, no en paralelo.

### T7 — [PROYECTO — requiere decisión de negocio] Backend con autenticación
- **Objetivo:** eliminar H1/H2: acceso por credenciales y cada paciente ve solo su ficha.
- **Alcance:** elegir plataforma (Supabase/Firebase u otra), modelar `patients`, mover `patientsData` al servidor con reglas de acceso por usuario, login real para doctora y pacientes.
- **Criterio de aceptación:** imposible ver la vista doctora o datos de otro paciente sin sesión válida (verificable con dos sesiones de navegador).
- **Nota:** no delegable como quick win; requiere decisión de stack, costos y flujo de alta de pacientes. **No iniciar sin aprobación.**

### Orden sugerido de ejecución
`T1 ∥ T3 ∥ T4` → `T2` → `T5` → `T6` → (aprobación) → `T7`.
T12 de accesibilidad (aria-labels, H12) puede sumarse a cualquier tanda como relleno.

---

## Supuestos explícitos

- Los nombres de pacientes y el número de WhatsApp parecen reales; se asumió que el
  artefacto es un prototipo pre-producción. Si ya está frente a pacientes, H1/H2
  pasan de "proyecto" a **incidente activo**.
- El happy-path con CDNs cargados no pudo ejecutarse en este entorno (red saliente
  restringida); su comportamiento se infirió del código y se marcó como tal.
- No hay entorno de despliegue detectable (sin CI, sin hosting config); se asumió
  distribución como archivo/hosting estático.
