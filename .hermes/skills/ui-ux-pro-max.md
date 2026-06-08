---
name: ui-ux-pro-max
description: "AI-powered design intelligence para web y mobile. 67 estilos UI, 161 paletas de color, 57 pares tipográficos, 161 reglas de razonamiento por industria, 99 guías UX y 25 tipos de charts para 15+ stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, HTML/CSS)."
version: 2.5.0
author: NextLevelBuilder (adaptado para Hermes)
license: MIT
tags: [ui, ux, design-system, color-palette, typography, accessibility, frontend]
---

# UI/UX Pro Max — Design Intelligence

Guía comprensiva de diseño UI/UX para aplicaciones web y móviles. Contiene 67 estilos, 161 paletas de color, 57 pares tipográficos, 161 tipos de producto con reglas de razonamiento, 99 guías UX y 25 tipos de charts para 10+ stacks tecnológicos.

## Cuando aplicar este skill

Este skill debe usarse cuando la tarea involucra **estructura UI, decisiones de diseño visual, patrones de interacción, o control de calidad de UX**.

### Uso obligatorio
- Diseñar nuevas páginas (Landing Page, Dashboard, Admin, SaaS, Mobile App)
- Crear o refactorizar componentes UI (botones, modales, formularios, tablas, charts)
- Elegir esquemas de color, tipografía, espaciado o sistemas de layout
- Revisar código UI por UX, accesibilidad o consistencia visual
- Implementar navegación, animaciones o comportamiento responsive
- Decisiones de diseño a nivel de producto (estilo, jerarquía de información, identidad de marca)

### Uso recomendado
- La UI "no se ve profesional" pero no sabes por qué
- Recibiste feedback sobre usabilidad o experiencia
- Optimización pre-lanzamiento de UI
- Alinear diseño cross-platform (Web / iOS / Android)
- Construir design systems o librerías de componentes reutilizables

### No es necesario
- Lógica pura de backend
- Solo APIs o base de datos
- Optimización de performance no relacionada con interfaz
- Infraestructura o DevOps
- Scripts o automatización no visuales

---

## Categorías de Reglas por Prioridad

| Prio | Categoría | Impacto | Checks Clave | Anti-Patterns |
|------|-----------|---------|--------------|---------------|
| 1 | Accesibilidad | CRITICO | Contraste 4.5:1, Alt text, Navegación teclado, Aria-labels | Quitar focus rings, Icon-only sin labels |
| 2 | Touch and Interacción | CRITICO | Min 44x44px, 8px+ spacing, Feedback de carga | Depender solo de hover, Transiciones instantáneas |
| 3 | Performance | ALTO | WebP/AVIF, Lazy loading, Espacio reservado (CLS < 0.1) | Layout thrashing, Cumulative Layout Shift |
| 4 | Selección de Estilo | ALTO | Match producto, Consistencia, Iconos SVG | Mezclar flat y skeuomorphic, Emojis como iconos |
| 5 | Layout and Responsive | ALTO | Mobile-first, Viewport meta, Sin scroll horizontal | Scroll horizontal, Containers px fijos, Deshabilitar zoom |
| 6 | Tipografía and Color | MEDIO | Base 16px, Line-height 1.5, Tokens semánticos | Texto < 12px body, Gray-on-gray, Hex raw en componentes |
| 7 | Animación | MEDIO | Duración 150-300ms, Movimiento con significado, Continuidad espacial | Animaciones decorativas, Animar width/height, Sin reduced-motion |
| 8 | Formularios and Feedback | MEDIO | Labels visibles, Error cerca del campo, Progressive disclosure | Placeholder como label, Solo errores arriba |
| 9 | Patrones de Navegación | ALTO | Back predecible, Bottom nav <=5, Deep linking | Nav sobrecargada, Back roto, Sin deep links |
| 10 | Charts and Datos | BAJO | Leyendas, Tooltips, Colores accesibles | Solo color para transmitir info |

---

## Referencia Rápida

### 1. Accesibilidad (CRITICO)

- `color-contrast` — Mínimo 4.5:1 texto normal (texto grande 3:1)
- `focus-states` — Focus rings visibles en interactivos (2-4px)
- `alt-text` — Alt text descriptivo para imágenes significativas
- `aria-labels` — aria-label en icon-only buttons
- `keyboard-nav` — Tab order coincide con orden visual
- `form-labels` — Usar label con atributo `for`
- `skip-links` — Skip to main content para teclado
- `heading-hierarchy` — h1->h6 secuencial, sin saltos
- `color-not-only` — No transmitir info solo con color (añadir icono/texto)
- `dynamic-type` — Soportar escalado de texto del sistema
- `reduced-motion` — Respetar `prefers-reduced-motion`
- `voiceover-sr` — accessibilityLabel/accessibilityHint significativos
- `escape-routes` — Cancel/back en modales y flujos multi-paso
- `keyboard-shortcuts` — Preservar shortcuts del sistema

### 2. Touch and Interacción (CRITICO)

- `touch-target-size` — Min 44x44pt (Apple) / 48x48dp (Material)
- `touch-spacing` — Min 8px/8dp entre touch targets
- `hover-vs-tap` — Usar click/tap para acciones primarias
- `loading-buttons` — Deshabilitar botón durante async; mostrar spinner
- `error-feedback` — Errores cerca del campo problemático
- `cursor-pointer` — cursor-pointer en clickables (Web)
- `gesture-conflicts` — Evitar swipe horizontal en contenido principal
- `tap-delay` — Usar `touch-action: manipulation`
- `standard-gestures` — Gestos estándar de plataforma
- `safe-area-awareness` — Targets fuera de notch, Dynamic Island
- `swipe-clarity` — Swipe actions deben mostrar affordance
- `drag-threshold` — Threshold antes de iniciar drag

### 3. Performance (ALTO)

- `image-optimization` — WebP/AVIF, srcset/sizes, lazy load
- `image-dimension` — width/height o aspect-ratio para evitar CLS
- `font-loading` — `font-display: swap/optional`
- `critical-css` — Priorizar CSS above-the-fold
- `lazy-loading` — Lazy load componentes no críticos
- `bundle-splitting` — Split por ruta/feature
- `third-party-scripts` — async/defer, auditar innecesarios
- `reduce-reflows` — Batch DOM reads antes de writes
- `virtualize-lists` — Virtualizar listas 50+ items
- `main-thread-budget` — <16ms por frame para 60fps
- `progressive-loading` — Skeleton screens >1s
- `input-latency` — <100ms para taps/scrolls
- `debounce-throttle` — Debounce/throttle en eventos frecuentes
- `offline-support` — Estado offline + fallback básico

### 4. Selección de Estilo (ALTO)

- `style-match` — Match estilo a tipo de producto
- `consistency` — Mismo estilo en todas las páginas
- `no-emoji-icons` — SVG icons (Heroicons, Lucide), no emojis
- `color-palette-from-product` — Paleta de la industria/producto
- `effects-match-style` — Sombras/blur/radius alineados con estilo
- `platform-adaptive` — Respetar idioms de plataforma (iOS HIG vs Material)
- `state-clarity` — Estados hover/pressed/disabled visualmente distintos
- `elevation-consistent` — Escala de elevación/sombras consistente
- `dark-mode-pairing` — Diseñar light/dark variants juntos
- `icon-style-consistent` — Un solo set de iconos en todo el producto
- `primary-action` — Solo un CTA primario por pantalla

### 5. Layout and Responsive (ALTO)

- `viewport-meta` — `width=device-width, initial-scale=1` (nunca deshabilitar zoom)
- `mobile-first` — Diseñar mobile-first, escalar a tablet/desktop
- `breakpoint-consistency` — Breakpoints sistemáticos (375/768/1024/1440)
- `readable-font-size` — Min 16px body en mobile
- `line-length-control` — Mobile 35-60 chars/linea; desktop 60-75
- `horizontal-scroll` — Sin scroll horizontal en mobile
- `spacing-scale` — Sistema de espaciado 4pt/8dp incremental
- `container-width` — max-w consistente en desktop
- `z-index-management` — Escala de z-index definida (0/10/20/40/100/1000)
- `viewport-units` — Preferir `min-h-dvh` sobre `100vh`
- `visual-hierarchy` — Jerarquía via tamaño, spacing, contraste
- `content-priority` — Contenido core primero en mobile

### 6. Tipografía and Color (MEDIO)

- `line-height` — 1.5-1.75 para body text
- `line-length` — 65-75 caracteres por línea
- `font-pairing` — Matching personalidades heading/body
- `font-scale` — Escala tipográfica consistente (12 14 16 18 24 32)
- `contrast-readability` — Texto oscuro sobre fondo claro
- `weight-hierarchy` — Bold headings (600-700), Regular body (400)
- `color-semantic` — Tokens semánticos (primary, secondary, error)
- `color-dark-mode` — Variantes desaturadas/claras, no invertir
- `color-accessible-pairs` — 4.5:1 (AA) o 7:1 (AAA)
- `truncation-strategy` — Preferir wrapping sobre truncation
- `letter-spacing` — Respetar letter-spacing por defecto
- `whitespace-balance` — Whitespace intencional para agrupar

### 7. Animación (MEDIO)

- `duration-timing` — 150-300ms micro-interacciones; complejas <=400ms
- `transform-performance` — Usar transform/opacity solo
- `loading-states` — Skeleton o progress indicator si >300ms
- `excessive-motion` — Animar 1-2 elementos clave por vista
- `easing` — ease-out para entrada, ease-in para salida
- `motion-meaning` — Cada animación con relación causa-efecto
- `state-transition` — Cambios de estado animados, no snap
- `continuity` — Transiciones con continuidad espacial
- `exit-faster-than-enter` — Salida 60-70% de duración de entrada
- `stagger-sequence` — Stagger listas 30-50ms por item
- `interruptible` — Animaciones interrumpibles por tap/gesture
- `modal-motion` — Modales desde su trigger source
- `layout-shift-avoid` — Animaciones sin causar reflow

### 8. Formularios and Feedback (MEDIO)

- `input-labels` — Label visible por input (no placeholder-only)
- `error-placement` — Error debajo del campo
- `submit-feedback` — Loading, success, error
- `required-indicators` — Marcar campos requeridos
- `empty-states` — Mensaje útil + acción cuando no hay contenido
- `toast-dismiss` — Auto-dismiss en 3-5s
- `confirmation-dialogs` — Confirmar antes de acciones destructivas
- `progressive-disclosure` — Revelar opciones complejas progresivamente
- `inline-validation` — Validar on blur (no keystroke)
- `input-type-keyboard` — Tipos semánticos (email, tel, number)
- `autofill-support` — autocomplete / textContentType
- `undo-support` — Permitir undo en acciones destructivas
- `error-clarity` — Causa + como arreglarlo
- `focus-management` — Auto-focus primer campo inválido tras error
- `aria-live-errors` — aria-live o role="alert" en errores
- `contrast-feedback` — Estados error/success con 4.5:1

### 9. Navegación (ALTO)

- `bottom-nav-limit` — Max 5 items con labels + iconos
- `drawer-usage` — Drawer/sidebar para navegación secundaria
- `back-behavior` — Back predecible, preservar scroll/state
- `deep-linking` — Todas las pantallas clave reachables via deep link
- `nav-label-icon` — Icono + texto en navegación
- `nav-state-active` — Ubicación actual resaltada visualmente
- `nav-hierarchy` — Separar nav primaria (tabs) de secundaria (drawer)
- `modal-escape` — Close/dismiss claro en modales
- `breadcrumb-web` — Breadcrumbs para jerarquías 3+ niveles
- `state-preservation` — Volver atrás restaura scroll/estado
- `overflow-menu` — Overflow menu cuando sobran acciones
- `adaptive-navigation` — >=1024px sidebar; <=768px bottom/top nav
- `back-stack-integrity` — No resetear stack silenciosamente
- `avoid-mixed-patterns` — No mezclar Tab + Sidebar + Bottom Nav

### 10. Charts and Datos (BAJO)

- `chart-type` — Match tipo de chart al tipo de dato
- `color-guidance` — Paletas accesibles; evitar solo red/green
- `data-table` — Alternativa de tabla para accesibilidad
- `pattern-texture` — Suplementar color con patterns/texturas
- `legend-visible` — Leyenda siempre visible
- `tooltip-on-interact` — Tooltips en hover (Web) o tap (mobile)
- `responsive-chart` — Charts reflow en pantallas pequeñas
- `empty-data-state` — Estado vacío significativo
- `loading-chart` — Skeleton mientras carga
- `large-dataset` — Agregar/muestrear 1000+ puntos
- `number-formatting` — Formato locale-aware
- `touch-target-chart` — Elementos interactivos >=44pt
- `sortable-table` — Tablas con sorting + aria-sort
- `error-state-chart` — Error message + retry

---

## Stacks Soportados

| Stack | Notas |
|-------|-------|
| React / Next.js | shadcn/ui, Tailwind CSS |
| Vue / Nuxt.js | Nuxt UI |
| Svelte / SvelteKit | |
| Angular | |
| Astro | |
| SwiftUI | iOS/macOS nativo |
| React Native / Flutter | Mobile cross-platform |
| HTML + Tailwind | CSS standalone |
| Laravel | |

---

## Integración con el proyecto

Este skill está diseñado para revisar y mejorar la calidad UI/UX del proyecto TaskForge360. Úsalo cuando:

- **Revises** componentes existentes (accesibilidad, consistencia visual)
- **Diseñes** nuevas páginas o features
- **Audites** la UI antes de un release
- **Optimices** la experiencia de usuario en formularios, navegación y feedback
- **Implementes** un design system con tokens semánticos

Para consultar detalles específicos, usa `--domain <dominio>` con: `style`, `color`, `typography`, `product`, `ux`, `chart`.
