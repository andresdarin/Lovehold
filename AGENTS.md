# Reglas de arquitectura — Lovehold

## Principio principal

Organizar el código por **dominio y funcionalidad**, no por tipo de archivo.

Cada feature vive en `features/<domain>/<feature>/` con su UI, hooks, tipos, utilidades y constantes cerca.

`components/` se reserva para componentes **globales reutilizables** (`ui/`, `layout/`).

## Estructura general

```
src/
  features/
    <domain>/
      <feature>/
        components/       # subcomponentes visuales del feature
        hooks/            # hooks del feature
        utils/            # lógica pura
        types.ts          # interfaces/tipos
        constants.ts      # valores fijos, labels, config
        __tests__/        # tests del feature
  components/
    ui/                   # primitivas globales (CustomSelect, etc.)
  lib/                    # infraestructura compartida
  app/                    # rutas y layouts (delgados)
```

## Límites de líneas

| Tipo de archivo | Máx |
|-----------------|----:|
| Página `app/**/page.tsx` | 80 |
| Componente visual | 150 |
| Hook | 80 |
| Utilidades / tipos / constantes | 100 |

Los límites son guía, no regla ciega. Un archivo puede superarlo levemente si sigue siendo claro. Pero debe dividirse si mezcla responsabilidades, incluso sin llegar al límite.

## Proceso de división

Cuando un archivo crece demasiado o mezcla responsabilidades:

1. Extraer subcomponentes → `components/` dentro del feature.
2. Extraer hooks → `hooks/` dentro del feature.
3. Extraer lógica pura → `utils/` dentro del feature.
4. Extraer tipos → `types.ts`.
5. Extraer constantes → `constants.ts`.
6. Mantener el archivo principal como orquestador delgado.

## Preferencias de código

- **Composición sobre herencia.**
- **Un solo propósito por archivo.**
- **Nombres PascalCase** para componentes, **camelCase** para hooks/utils.
- **'use client'** solo cuando sea estrictamente necesario (eventos, estado, efectos).
- **Props interfaces**: en el mismo archivo (si son pequeñas) o en `types.ts` (si se reusan).
- **Evitar useEffect** cuando sea posible; preferir eventos del usuario o derivar estado.
- **Tailwind**: clases directamente, extraer a `cx()` solo si hay lógica condicional compleja.

## Hooks

- Dentro de cada feature en `hooks/` si hay más de 3, o `hooks.ts` si son pocos.
- Hooks globales (cross-feature) van en `src/hooks/`.

## Pages / Route segments

- Máximo ~80 líneas.
- Son orquestadores: no contienen lógica de negocio ni fetching complejo.
- La lógica de datos va en hooks del feature correspondiente.

## Regla de ownership

Antes de crear un archivo, preguntar:

> ¿Esto pertenece a toda la app o solo a una funcionalidad?

- **Global**: `components/ui/`, `lib/`
- **Feature**: `features/<domain>/<feature>/`

## Buenas prácticas

- Un feature no debe depender profundamente de la estructura interna de otro feature.
- Tests cerca del código que validan (`__tests__/` o junto al archivo).
- Evitar abstracciones prematuras.
- Evitar carpetas genéricas como basurero.
- La estructura debe permitir encontrar rápido: UI, hooks, tipos, constantes, utilidades y tests de cualquier feature.

## Recordatorio para la IA

Al crear o editar un componente:
1. Contar líneas del archivo.
2. Si se acerca al límite, planificar división.
3. Crear subcomponentes/hooks/utils necesarios dentro del feature.
4. Mantener el archivo principal como orquestador delgado.
