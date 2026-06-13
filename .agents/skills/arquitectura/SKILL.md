# Arquitectura limpia — Lovehold

## Descripción
Mantiene componentes pequeños, extrae subcomponentes/hooks/utils cuando se superan los límites de líneas.

## Triggers
- El usuario pide crear o modificar un componente
- El usuario pregunta sobre estructura/organización del proyecto
- Un archivo en `components/` supera las 150 líneas

## Reglas

### Límites
| Tipo de archivo | Límite máximo |
|----------------|---------------|
| Componente (`*.tsx`) | 150 líneas |
| Hook (`use*.ts`) | 80 líneas |
| Utilidad (`utils.ts`, `types.ts`) | 100 líneas |
| Página (`app/**/page.tsx`) | 80 líneas |

### Proceso de división
1. Identificar secciones lógicas dentro del componente (header, nav, footer, list, form, etc.)
2. Extraer cada sección a su propio archivo: `ComponenteSeccion.tsx`
3. Extraer lógica de estado/efectos a hooks: `hooks.ts`
4. Extraer lógica pura (cálculos, formateo) a: `utils.ts`
5. Extraer interfaces reusables a: `types.ts`
6. Extraer valores fijos a: `constants.ts`
7. El componente principal solo importa y orquesta

### Estructura de feature
```
components/<feature>/
├── <Componente>.tsx
├── <Componente>Parte.tsx
├── hooks.ts
├── utils.ts
└── types.ts
```

### Buenas prácticas
- Composición sobre herencia
- Una responsabilidad por archivo
- PascalCase para componentes, camelCase para hooks/utils
- `'use client'` solo cuando es necesario
- Props interfaces inline si son pequeñas, en `types.ts` si se reusan
- Preferir eventos del usuario sobre useEffect
- Tailwind inline, extraer a `cx()` solo si hay lógica condicional compleja

### Ejemplo: Sidebar (218 → ~50 líneas)
- `Sidebar.tsx` → orquestador delgado
- `SidebarHeader.tsx` → logo + toggle collapse
- `SidebarNav.tsx` → nav items + indicador animado
- `SidebarFooter.tsx` → theme toggle + perfil + logout
- `hooks.ts` → lógica del indicador (useAnimatedIndicator)
