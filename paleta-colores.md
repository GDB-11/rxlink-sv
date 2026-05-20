# Paleta de colores — Sistema de recetas

> Tailwind CSS 4 · Tono cálido/humano · Soporte modo claro y oscuro

---

## Primario — Teal

| Rol | Clase Tailwind | Hex | Uso |
|---|---|---|---|
| Fondo suave (badge) | `teal-100` | `#ccfbf1` | Badge "Activo" modo claro |
| Acento medio | `teal-300` | `#5eead4` | Texto badge modo oscuro |
| Botón principal | `teal-500` | `#14b8a6` | Botón primario modo claro |
| Botón principal (dark) | `teal-600` | `#0d9488` | Botón primario modo oscuro |
| Focus ring | `teal-500` | `#14b8a6` | Outline de inputs activos |
| Fondo suave (dark) | `teal-900` | `#134e4a` | Badge "Activo" modo oscuro |

```html
<!-- Botón primario -->
<button class="bg-teal-500 text-teal-50 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700">
  Guardar receta
</button>

<!-- Badge suave -->
<span class="bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-300">
  Activo
</span>
```

---

## Neutro / superficie — Stone

| Rol | Clase Tailwind | Hex claro | Hex oscuro |
|---|---|---|---|
| Fondo de página | `stone-100` / `stone-900` | `#f5f5f4` | `#1c1917` |
| Fondo de tarjeta | `white` / `stone-800` | `#ffffff` | `#292524` |
| Borde | `stone-200` / `stone-700` | `#e7e5e4` | `#44403c` |
| Texto principal | `stone-900` / `stone-50` | `#1c1917` | `#fafaf9` |
| Texto secundario | `stone-500` / `stone-400` | `#78716c` | `#a8a29e` |
| Texto terciario | `stone-400` / `stone-600` | `#a8a29e` | `#57534e` |

```html
<!-- Tarjeta -->
<div class="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
  <p class="text-stone-900 dark:text-stone-50">Dr. Andrés Salinas</p>
  <p class="text-stone-500 dark:text-stone-400">Cardiología</p>
</div>
```

---

## Éxito / confirmación — Emerald

| Rol | Clase Tailwind | Hex claro | Hex oscuro |
|---|---|---|---|
| Fondo badge | `emerald-100` / `emerald-900` | `#d1fae5` | `#064e3b` |
| Texto badge | `emerald-900` / `emerald-300` | `#064e3b` | `#6ee7b7` |
| Ícono / indicador | `emerald-500` / `emerald-400` | `#10b981` | `#34d399` |

Estados: `Dispensado`, `Finalizado`, validaciones correctas.

```html
<span class="bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-300">
  Dispensado
</span>
```

---

## Advertencia — Amber

| Rol | Clase Tailwind | Hex claro | Hex oscuro |
|---|---|---|---|
| Fondo badge | `amber-100` / `amber-900` | `#fef3c7` | `#78350f` |
| Texto badge | `amber-900` / `amber-300` | `#78350f` | `#fcd34d` |
| Ícono / indicador | `amber-500` / `amber-400` | `#f59e0b` | `#fbbf24` |

Estados: `Suspendido`, alertas de alergia, vencimiento próximo.

```html
<span class="bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-300">
  Suspendido
</span>
```

---

## Peligro / error — Rose

| Rol | Clase Tailwind | Hex claro | Hex oscuro |
|---|---|---|---|
| Fondo badge | `rose-100` / `rose-900` | `#ffe4e6` | `#881337` |
| Texto badge | `rose-900` / `rose-300` | `#881337` | `#fda4af` |
| Ícono / indicador | `rose-500` / `rose-400` | `#f43f5e` | `#fb7185` |

Estados: `Caducado`, acciones destructivas (eliminar, revocar token).

```html
<span class="bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-300">
  Caducado
</span>
```

---

## Información — Sky

| Rol | Clase Tailwind | Hex claro | Hex oscuro |
|---|---|---|---|
| Fondo badge | `sky-100` / `sky-900` | `#e0f2fe` | `#0c4a6e` |
| Texto badge | `sky-900` / `sky-300` | `#0c4a6e` | `#7dd3fc` |
| Ícono / indicador | `sky-500` / `sky-400` | `#0ea5e9` | `#38bdf8` |

Estados: `Borrador`, tooltips informativos, badges de solo lectura.

```html
<span class="bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-300">
  Borrador
</span>
```

---

## Estados de receta — resumen

| Estado | Semántica | Claro | Oscuro |
|---|---|---|---|
| Borrador | Sky | `bg-sky-100 text-sky-900` | `dark:bg-sky-900 dark:text-sky-300` |
| Activo | Teal | `bg-teal-100 text-teal-900` | `dark:bg-teal-900 dark:text-teal-300` |
| Suspendido | Amber | `bg-amber-100 text-amber-900` | `dark:bg-amber-900 dark:text-amber-300` |
| Finalizado | Emerald | `bg-emerald-100 text-emerald-900` | `dark:bg-emerald-900 dark:text-emerald-300` |
| Dispensado | Emerald | `bg-emerald-100 text-emerald-900` | `dark:bg-emerald-900 dark:text-emerald-300` |
| Caducado | Rose | `bg-rose-100 text-rose-900` | `dark:bg-rose-900 dark:text-rose-300` |

---

## Regla de inversión (modo oscuro)

El patrón es consistente en todas las rampas semánticas:

- **Fondo**: `-100` en claro → `-900` en oscuro
- **Texto**: `-900` en claro → `-300` en oscuro
- **Íconos activos**: `-500` en claro → `-400` en oscuro
- **Botón primario**: `teal-500` en claro → `teal-600` en oscuro
- **Fondos de página/tarjeta**: stone invertido (`100`→`900`, `white`→`stone-800`)

---

## Inputs

```html
<!-- Estado normal -->
<input class="border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400
              dark:border-stone-700 dark:bg-stone-800 dark:text-stone-50 dark:placeholder:text-stone-600" />

<!-- Estado focus -->
<input class="ring-2 ring-teal-500 border-teal-500 bg-teal-50
              dark:ring-teal-600 dark:border-teal-600 dark:bg-teal-950" />

<!-- Estado error -->
<input class="border-rose-500 bg-rose-50 text-rose-900
              dark:border-rose-500 dark:bg-rose-950 dark:text-rose-100" />
```

---

*Generado para: Sistema clínico de recetas · Stack: Svelte 5 + Tailwind CSS 4 + .NET 10 + PostgreSQL 18*
