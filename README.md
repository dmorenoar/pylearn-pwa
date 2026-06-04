# 🐍 PyLearn PWA

Plataforma para aprender Python con ejercicios interactivos verificados por IA, al estilo Snakify. Funciona como **Progressive Web App** (instalable en móvil y escritorio).

## Estructura

```
pylearn-pwa/
├── public/
│   ├── index.html        ← Shell HTML con registro del SW y banner de instalación
│   ├── manifest.json     ← Manifest de la PWA (nombre, iconos, colores)
│   ├── sw.js             ← Service Worker (caché, offline)
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   └── app.jsx           ← Toda la app React (sin build step, via Babel CDN)
├── vercel.json           ← Configuración para Vercel
└── netlify.toml          ← Configuración para Netlify
```

## Deploy rápido

### Opción 1 – Vercel (recomendado)
```bash
npm i -g vercel
cd pylearn-pwa
vercel --prod
```
La carpeta raíz es `public/` y `src/` se sirve estáticamente.

> En Vercel, configura **Root Directory** como `.` (raíz) y **Output Directory** como `public`.

### Opción 2 – Netlify
1. Arrastra la carpeta `pylearn-pwa/` al dashboard de Netlify
2. Publish directory: `public`

### Opción 3 – GitHub Pages
```bash
# Pon todo en una rama gh-pages o en /docs
# Asegúrate de que index.html está en la raíz
```

### Opción 4 – Servidor local para probar
```bash
npx serve public
# Abre http://localhost:3000
```

## Características PWA

- ✅ **Instalable** – Banner nativo en Chrome/Edge/Android. En iOS: "Compartir → Añadir a pantalla de inicio"
- ✅ **Service Worker** – Cachea el shell para carga offline instantánea
- ✅ **Offline indicator** – Toast rojo si no hay conexión
- ✅ **Responsive** – Layout adaptado para móvil y escritorio
- ✅ **Persistencia** – Progreso y borradores guardados en `localStorage`
- ✅ **Safe area** – Compatible con notch/Dynamic Island de iPhone

## Funcionalidades

- 10 ejercicios en 4 niveles (Iniciación → Avanzado)
- Verificación de código con IA (Claude Sonnet)
- Pistas inteligentes adaptadas al código actual
- Guardado automático de borradores por ejercicio
- Progreso persistente entre sesiones

## Notas

- La API de Anthropic requiere conexión. Las funciones de IA no funcionan offline.
- El shell (UI, ejercicios, editor) sí carga offline gracias al Service Worker.
- No se necesita build step: Babel se carga desde CDN y transpila `app.jsx` en el navegador.
  Para producción de alta escala, considera compilar con Vite.
