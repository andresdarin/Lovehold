# FINANCE ENGINE SPEC V1.1 — FROZEN

## Estado FROZEN

Esta especificación queda congelada. Define el contrato normativo del motor de
finanzas de Lovehold para V1.1. Los refinamientos futuros están bloqueados,
salvo que se demuestre una contradicción interna, una imposibilidad de cumplir
este contrato o un requisito legal de mayor jerarquía.

## Cambios V1.1

### 1. ScheduledCashFlow OUTFLOW + PAID

Un `ScheduledCashFlow` con `direction=OUTFLOW` y `lifecycle=PAID` debe tener
exactamente un `PersonalExpense`: nunca cero y nunca duplicado. Conceptualmente,
`PersonalExpense` incorpora `scheduledCashFlowId?: string` y
`scheduledDueOn?: string` (fecha `Date`). Cuando ambos están presentes forman la
clave lógica `UNIQUE(scheduledCashFlowId, scheduledDueOn)`.

La creación o reconciliación del gasto, la actualización de
`FinanceAccount.balance`, `lastResolved*` y el avance de `nextDueOn` se confirma
en una única transacción atómica. No se introduce una tabla de ocurrencias.
Al reconciliar un gasto existente se validan `amount`, `currency` y `direction`
y no se crea otro registro. Al crear uno nuevo se valida la unicidad de la
clave lógica, incluyendo carreras concurrentes.

`FinanceAccount` representa únicamente saldos gestionados por Lovehold. La
sincronización bancaria está fuera de V1. Si una cuenta tiene saldo externo,
esa fuente es la autoridad; resolver un `ScheduledCashFlow` no debe mutar ese
saldo externo directamente.

### 2. FX histórico

`getSpendingByCategory` y toda analítica histórica seleccionan FX por la fecha
de la transacción, nunca por la cotización vigente. Si falta la cotización
histórica, se conservan `totalsByCurrency`, `convertedTotal` es `null` y se
emite `MISSING_HISTORICAL_FX` (`HistoricalFxWarningCode` en
`packages/shared/src/schemas/finance.ts`). Snapshots y simulaciones seleccionan
FX cuyo `asOf` corresponde al `asOf` de la operación.

## Semántica de spendingCapacity

Todos los importes son `DecimalMoney` con dos decimales y moneda explícita.
`protectedCapacity` es el saldo disponible después de reservar obligaciones
programadas, aportes de metas y `minimumBuffer`; no es dinero recomendado para
gastar. `recommendedSpend` es el importe que el motor recomienda para el
período solicitado (hoy, fin de semana o resto del mes), sin consumir la
capacidad protegida. Nunca se reutiliza el antiguo escalar `safeToSpend`.

Las simulaciones agregan un veredicto: `SAFE` si el plan conserva las reservas,
`CAUTION` si reduce margen sin romperlas, y `UNSAFE` si incumple buffer,
obligaciones o invariantes de metas. Las ventanas no deben solaparse ni contar
dos veces el mismo día.

## Lifecycle ScheduledCashFlow

Los estados son `PAID`, `RECEIVED`, `SKIPPED` y `OVERDUE`. Un inflow
`RECEIVED` y un outflow `PAID` resuelven el flujo; un outflow `OVERDUE` sigue
siendo una obligación; `SKIPPED` no se contabiliza como resuelto. Para un
outflow pagado se aplica obligatoriamente la regla de exactamente un
`PersonalExpense` y la transacción atómica de V1.1. El calendario avanza
`nextDueOn` según la regla de recurrencia, preservando el día 31: febrero usa
el último día disponible y el ciclo siguiente vuelve al 31.

## Invariante SavingsGoal

Una meta es financiable sólo con fondos no gastables. Para cada meta,
`currentAmount` no puede exceder el `nonSpendable` que la respalda. Si excede,
el resultado es `VIOLATED`; si no puede determinarse por falta de datos es
`UNVERIFIABLE`. Una meta verificada informa `required`, `funded` y, cuando
corresponde, `shortfall`. El motor no convierte saldo gastable en financiación
de meta implícitamente.

## FX: bid/ask + histórico

Para un par UYU/USD, `bid` es el precio de compra de la moneda base por el
mercado y `ask` el precio de venta. La conversión conservadora usa el lado que
protege la solvencia: activos convertidos al lado desfavorable de venta y
obligaciones al lado desfavorable de compra, según la dirección de la
conversión. El redondeo monetario es determinista: `floor` para capacidad
disponible y `ceil` para obligaciones/reservas. Nunca se usa el FX vigente para
una transacción histórica; la ausencia histórica no se reemplaza por una
cotización aproximada.

## Contratos

Los nombres, tipos, códigos de advertencia y formas de salida se referencian
en `packages/shared/src/schemas/finance.ts`, especialmente
`SpendingCapacitySchema`, `ScheduledCashFlowSchema`,
`PersonalExpenseLinkSchema`, `FinancialSnapshotSchema` y
`GetSpendingByCategoryOutputSchema`. Este documento agrega la semántica
normativa que los contratos estructurales no pueden expresar por sí solos.
