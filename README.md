# Hunza Care — Portal de Seguimiento Postoperatorio

Aplicación web estática (demo/MVP) para una clínica estética: las pacientes ven su
línea de tiempo de recuperación, citas pendientes y cuidados frecuentes; la doctora
ve un semáforo de triaje y un panel de análisis.

**Estado: prototipo demostrable, sin backend.** Los datos son semilla de
demostración y el triaje persiste en `localStorage`. No hay autenticación real:
no usar con datos de pacientes reales (ver `AUDITORIA.md`).

## Cómo ejecutar la demo

No requiere build ni servidor: abrir `index.html` en cualquier navegador moderno.
Funciona 100 % offline (todas las dependencias están vendorizadas en `assets/`).

Opcionalmente, servirla local: `python3 -m http.server 8000` y abrir
`http://localhost:8000`.

## Guion de demo (< 3 minutos)

1. **Login** → pantalla de acceso con los dos perfiles.
2. **Dashboard Dra. Macarena** → métricas, gráfico de análisis (rotulado "Datos
   de demostración") y semáforo de triaje ordenado por urgencia.
3. Cambiar la prioridad de una paciente con el semáforo → **recargar la página**
   → el cambio persiste (localStorage).
4. Volver al login → entrar como **Valentina Soto** → línea de tiempo de
   recuperación, cita pendiente con agendamiento por WhatsApp, FAQ de cuidados.
5. "Reiniciar demo" en el login restaura los datos semilla para repetir la demo.

## Estructura

```
index.html              Entrada de la app
assets/js/app.js        Toda la lógica y las vistas (vanilla JS, sin framework)
assets/css/app.css      Tailwind compilado (generado, no editar a mano)
assets/css/fonts.css    @font-face de las fuentes locales
assets/fonts/           Montserrat + Playfair Display (woff2, vía @fontsource)
assets/vendor/          Chart.js 4.5.1 y Lucide 1.24.0 (versiones fijadas)
src/tailwind.css        Fuente de estilos (input de Tailwind)
tailwind.config.js      Config de Tailwind (fuentes, contenido escaneado)
AUDITORIA.md            Auditoría técnica y backlog
```

## Desarrollo

Los estilos se editan en `src/tailwind.css` y se recompilan con:

```bash
npm install
npm run build:css      # o npm run watch:css durante el desarrollo
```

Si se agregan clases de Tailwind nuevas en `app.js` o `index.html`, hay que
recompilar el CSS (el build escanea esos dos archivos).

## Limitaciones conocidas (fuera del MVP)

- **Sin autenticación ni backend**: cualquier persona con el archivo ve todas
  las vistas. Bloqueante antes de usar con pacientes reales (backlog T7).
- **El gráfico de análisis usa datos ilustrativos** (rotulados en la UI);
  conectarlo a datos reales de agenda es decisión de producto pendiente.
- El número de WhatsApp está en `assets/js/app.js` (`WHATSAPP_NUMBER`).
