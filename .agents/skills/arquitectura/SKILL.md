# Arquitectura limpia — Lovehold

## Descripción

Mantener una estructura escalable, clara y fácil de modificar a medida que la aplicación crece.
El código debe organizarse por dominio funcional, con componentes pequeños, páginas delgadas y lógica desacoplada.

La prioridad no es separar archivos por extensión, sino por responsabilidad, cercanía al feature y facilidad de mantenimiento.

---

## Principio principal

Organizar el código por dominio y funcionalidad.

Evitar estructuras basadas únicamente en tipo de archivo:

```txt
components/
hooks/
utils/
types/
```

Preferir estructuras donde cada feature tenga cerca su UI, hooks, tipos, utilidades, constantes y tests:

```txt
features/
  <domain>/
    <feature>/
      components/
      hooks/
      utils/
      types.ts
      constants.ts
```

`src/components` debe reservarse para componentes realmente reutilizables a nivel global.

---

## Triggers

Aplicar esta regla cuando:

* Se crea o modifica una pantalla.
* Se crea o modifica un componente.
* Se agrega lógica a un feature existente.
* Un archivo empieza a mezclar UI, estado, efectos y lógica de negocio.
* Un componente supera las 150 líneas.
* Un hook supera las 80 líneas.
* Una página `app/**/page.tsx` supera las 80 líneas.
* Un archivo de utilidades, tipos o constantes supera las 100 líneas.
* Una carpeta empieza a contener archivos sin una responsabilidad clara.

---

## Límites recomendados

| Tipo de archivo                 | Límite máximo |
| ------------------------------- | ------------: |
| Página `app/**/page.tsx`        |     80 líneas |
| Componente orquestador          |    100 líneas |
| Componente visual               |    150 líneas |
| Hook                            |     80 líneas |
| Utilidades / tipos / constantes |    100 líneas |

Los límites son una guía, no una regla ciega.

Un archivo puede superar levemente el límite si sigue siendo claro.
Un archivo debe dividirse aunque no supere el límite si mezcla responsabilidades.

---

## Estructura general recomendada

```txt
src/
  app/
    <route>/
      page.tsx

  components/
    ui/
    layout/
    shell/
    shared/

  features/
    <domain>/
      <feature>/
        components/
        hooks/
        utils/
        types.ts
        constants.ts
        __tests__/

  lib/
    <shared-infrastructure>

  styles/
    <global-styles>
```

---

## Responsabilidad de cada carpeta

### `app/`

Debe contener rutas, layouts y páginas.

Las páginas deben ser delgadas y delegar la lógica en componentes del feature correspondiente.

Permitido:

```tsx
export default function Page() {
  return <FeaturePageContent />;
}
```

Evitar:

* Formularios completos dentro de `page.tsx`.
* Fetching complejo mezclado con UI.
* Lógica de filtros, cálculos o parseo dentro de la página.
* Estados complejos directamente en la ruta.

---

### `features/`

Debe contener lógica agrupada por dominio funcional.

Cada feature puede tener:

```txt
<feature>/
  components/
  hooks/
  utils/
  types.ts
  constants.ts
  __tests__/
```

Usar esta carpeta para todo lo que pertenece a una funcionalidad concreta de la app.

---

### `components/`

Debe contener componentes compartidos a nivel global.

Ejemplos válidos:

```txt
components/
  ui/
  layout/
  shell/
  shared/
```

Evitar colocar features completos dentro de `components/`.

Si un componente solo tiene sentido dentro de una funcionalidad específica, debe vivir dentro de `features/`.

---

### `lib/`

Debe contener infraestructura, clientes, helpers globales o integraciones compartidas.

Ejemplos:

```txt
lib/
  api/
  auth/
  config/
  validators/
```

No debe convertirse en una carpeta genérica para cualquier función suelta.

---

## Proceso de división

Cuando un archivo crece demasiado o mezcla responsabilidades:

1. Identificar las secciones lógicas.
2. Separar componentes visuales en `components/`.
3. Extraer estado, handlers y efectos a hooks.
4. Extraer cálculos puros, formateos y transformaciones a utilidades.
5. Extraer tipos reutilizables a `types.ts`.
6. Extraer valores fijos a `constants.ts`.
7. Mantener el archivo principal como orquestador delgado.

---

## Componentes

Un componente debe tener una responsabilidad clara.

Preferir componentes que:

* Reciben datos por props.
* Renderizan una parte concreta de la UI.
* No mezclan demasiados estados internos.
* No conocen detalles innecesarios de otros features.
* Son fáciles de leer sin hacer scroll excesivo.

Evitar componentes que:

* Renderizan toda una pantalla completa.
* Tienen muchas ramas condicionales.
* Contienen lógica de negocio.
* Hacen parseo, cálculos o transformaciones complejas.
* Mezclan formulario, listado, filtros, resumen y navegación en el mismo archivo.

---

## Hooks

Usar hooks para encapsular:

* Estado local complejo.
* Efectos.
* Filtros.
* Handlers.
* Coordinación de formularios.
* Lógica de interacción.

Estructura recomendada:

```txt
hooks/
  useFeatureData.ts
  useFeatureFilters.ts
  useFeatureForm.ts
```

Usar `hooks.ts` solo cuando el feature sea pequeño.

Si `hooks.ts` crece demasiado, dividirlo en hooks específicos.

---

## Utils

Usar utilidades para lógica pura:

* Formateo.
* Cálculos.
* Agrupaciones.
* Normalización.
* Parseo.
* Transformaciones de datos.

Estructura permitida para features pequeños:

```txt
utils.ts
```

Estructura recomendada cuando crece:

```txt
utils/
  formatValue.ts
  groupItems.ts
  calculateSummary.ts
```

Las funciones de `utils` no deberían depender de React.

---

## Types

Las interfaces pequeñas de props pueden vivir dentro del componente.

Mover a `types.ts` cuando:

* Se reutilizan en varios archivos.
* Representan entidades del dominio.
* Definen contratos entre componentes, hooks o servicios.
* Empiezan a ensuciar el componente visual.

---

## Constants

Usar `constants.ts` para:

* Labels.
* Opciones de filtros.
* Configuraciones fijas.
* Valores por defecto.
* Maps de estados, categorías o variantes visuales.

Evitar hardcodear valores repetidos dentro de múltiples componentes.

---

## Tests

Los tests deben vivir cerca del código que validan.

Opciones válidas:

```txt
<feature>/
  __tests__/
```

O junto al archivo testeado:

```txt
utils/
  calculateSummary.ts
  calculateSummary.test.ts
```

Evitar una carpeta global de tests si aleja demasiado la prueba del código real.

---

## `'use client'`

Usar `'use client'` solo cuando sea necesario.

Requiere `'use client'` si el archivo usa:

* Estado de React.
* Efectos.
* Eventos del usuario.
* Hooks del cliente.
* APIs del navegador.

Evitar marcar como cliente componentes que solo renderizan UI estática o reciben props.

---

## Estilos

Usar Tailwind inline por defecto.

Extraer clases solo cuando:

* Hay lógica condicional compleja.
* Se repiten muchas veces.
* Mejoran claramente la lectura.
* Representan una variante reusable.

Evitar crear abstracciones visuales prematuras.

---

## Reglas de importación

Mantener imports simples y predecibles.

Preferir imports cercanos al feature.

Evitar ciclos entre features.

Un feature puede importar:

* Componentes globales desde `components/`.
* Utilidades compartidas desde `lib/`.
* Tipos globales si existen.
* Sus propios componentes, hooks, types y utils.

Un feature no debería depender profundamente de la estructura interna de otro feature.

---

## Regla de ownership

Antes de crear un archivo, preguntar:

> ¿Esto pertenece a toda la app o solo a una funcionalidad?

Si pertenece a toda la app:

```txt
components/
lib/
styles/
```

Si pertenece a una funcionalidad concreta:

```txt
features/<domain>/<feature>/
```

---

## Buenas prácticas

* Composición sobre herencia.
* Una responsabilidad por archivo.
* Páginas delgadas.
* Componentes visuales simples.
* Hooks para lógica de interacción.
* Utils para lógica pura.
* Tipos compartidos en `types.ts`.
* Constantes compartidas en `constants.ts`.
* Tests cerca del código.
* No separar por extensión `.ts` / `.tsx`.
* No crear abstracciones antes de necesitarlas.
* No usar carpetas genéricas como basurero.
* Evitar archivos enormes aunque todavía funcionen.
* Evitar duplicar lógica entre features.

---

## Regla final

La estructura debe permitir que cualquier dev pueda abrir un feature y encontrar rápidamente:

* Su UI.
* Sus hooks.
* Sus tipos.
* Sus constantes.
* Sus utilidades.
* Sus tests.

Si para modificar una funcionalidad hay que saltar por muchas carpetas globales, la estructura está mal orientada.
