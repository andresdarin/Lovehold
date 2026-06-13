# Reglas de arquitectura — Lovehold

## Límite de líneas

- Ningún archivo de componente debe superar las **150 líneas**.
- Ningún hook debe superar las **80 líneas**.
- Ningún archivo de utilidades/tipos debe superar las **100 líneas**.

## Cuándo dividir

Si un componente supera el límite, dividirlo siguiendo este orden de prioridad:

1. **Extraer subcomponentes** → `components/<feature>/<Componente>Parte.tsx`
2. **Extraer hooks** → `components/<feature>/hooks.ts` (o `hooks/<nombre>.ts`)
3. **Extraer lógica pura/utils** → `components/<feature>/utils.ts`
4. **Extraer tipos** → `components/<feature>/types.ts`
5. **Extraer constantes** → `components/<feature>/constants.ts`

## Estructura de componentes

```
components/<feature>/
├── <Componente>.tsx          # componente principal (~150 líneas máx)
├── <Componente>Header.tsx    # subcomponente
├── <Componente>List.tsx      # subcomponente
├── <Componente>Form.tsx      # formularios
├── hooks.ts                  # hooks del feature
├── utils.ts                  # lógica pura
└── types.ts                  # interfaces/tipos
```

### Ejemplos concretos para este proyecto

```
components/app-shell/
├── AppShell.tsx              # layout principal (ya bien)
├── Sidebar.tsx               # ~218 líneas → DIVIDIR
│   ├── Sidebar.tsx           # componente principal reducido
│   ├── SidebarHeader.tsx     # logo + toggle
│   ├── SidebarNav.tsx        # items de navegación + indicador
│   ├── SidebarFooter.tsx     # theme toggle + perfil + logout
│   └── hooks.ts              # lógica de indicador animado
├── MobileNav.tsx
├── Topbar.tsx
└── ThemeToggle.tsx
```

```
components/expenses/          # (futuro)
├── ExpenseList.tsx
├── ExpenseCard.tsx
├── ExpenseForm.tsx
├── ExpenseFilters.tsx
├── hooks.ts                  # useExpenses, useFilters
├── utils.ts                  # formatCurrency, groupByDate
└── types.ts
```

## Preferencias de código

- **Composición sobre herencia**: Siempre prefiere composición.
- **Un solo propósito por archivo**: Cada archivo debe tener una sola responsabilidad.
- **Nombres de archivo en PascalCase** para componentes, **camelCase** para hooks/utils.
- **'use client'** solo cuando sea estrictamente necesario (eventos, estado, efectos).
- **Props interfaces** definidas en el mismo archivo (si son pequeñas) o en `types.ts` (si se reusan).
- **Evitar useEffect** cuando sea posible; preferir eventos del usuario o derivar estado.
- **Tailwind**: Usar clases directamente, extraer a `cx()` solo si hay lógica condicional compleja.

## Hooks

- Cada hook en su propio archivo dentro de `components/<feature>/hooks/` si hay más de 3 hooks, o en `hooks.ts` si son pocos.
- Hooks globales van en `src/hooks/`.

## Pages / Route segments

- Las páginas en `app/` deben ser lo más delgadas posible (máximo ~80 líneas).
- Su función es **orquestar componentes**, no contener lógica.
- La lógica de datos va en hooks o en Server Components.

## Recordatorio para la IA

Cuando crees o edites un componente:
1. Cuenta las líneas del archivo.
2. Si se acerca al límite, planifica la división.
3. Crea los subcomponentes/hooks/utils necesarios.
4. Mantén el componente principal como orquestador delgado.
