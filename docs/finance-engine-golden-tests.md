# FinanceEngine golden tests — break-the-engine

Especificación de regresión para intentar romper el motor financiero. No implementa el
motor ni modifica `schema.prisma`. Todos los importes se comparan como strings
decimales; las variantes marcadas como “derivada” reutilizan el fixture indicado y
alteran únicamente el dato bajo prueba.

| # | Fixture | Acción | Expectativa mínima |
|---:|---|---|---|
| 1 | `snapshot-2026-08-29-uyu.json` | `getFinancialSnapshot` / `simulatePurchase` | Base 2026-08-29: `protectedCapacity=15000.00`, `recommended today=5000.00`; 5000 SAFE, 12000 CAUTION, 20000 UNSAFE. |
| 2 | `snapshot-2026-08-29-uyu.json` (derivada) | `simulatePurchase` | 5000.00 SAFE; 5000.01 CAUTION; 15000.00 CAUTION; 15000.01 UNSAFE. |
| 3 | `snapshot-intra-month-uyu.json` | `getFinancialSnapshot` / `simulatePurchase` | Antes de cobrar sueldo: `protectedCapacity.today=0.00`; cualquier compra `>0` es UNSAFE. |
| 4 | `snapshot-2026-08-29-uyu.json` (derivada) | `getFinancialSnapshot` | `OVERDUE` sigue contando en `committedOutflows` hasta `PAID` o `SKIPPED` explícito; nunca auto-skip. |
| 5 | `scheduled-day31.json` (derivada) | `resolveScheduledCashFlow` | Resolver dos veces el mismo `scheduledDueOn` no duplica y devuelve resultado idempotente. |
| 6 | `scheduled-day31.json` (derivada) | `resolveScheduledCashFlow` | OUTFLOW PAID sin link falla; un link único pasa; duplicate `(scheduledCashFlowId, scheduledDueOn)` falla. |
| 7 | `scheduled-day31.json` (derivada) | `resolveScheduledCashFlow` | Reconciliar expense existente con amount/currency/direction iguales reutiliza; mismatch devuelve error. |
| 8 | `scheduled-day31.json` | `getFinancialSnapshot` | Luego de PAID, el schedule sale de `committedOutflows` y el balance ya descontado no se descuenta otra vez. |
| 9 | `scheduled-day31.json` | `resolveScheduledCashFlow` | Día 31: 2026-01-31 → 2026-02-28 → 2026-03-31; bisiesto 2024-01-31 → 2024-02-29. |
| 10 | `snapshot-2026-08-29-uyu.json` (derivada) | `getFinancialSnapshot` | 2026-08-29: weekend 30–31 dentro del mes; 2026-08-31: próximo weekend en septiembre. |
| 11 | `scheduled-day31.json` (derivada) | `resolveScheduledCashFlow` | Dos vencidos se resuelven en orden; resolver el primero no salta el segundo. |
| 12 | `goal-invariant-violated.json` | `getFinancialSnapshot` | `nonSpendable=40000 < current=60000` ⇒ `goalFundingInvariant=VIOLATED` y warning. |
| 13 | `goal-invariant-violated.json` (derivada) | `getFinancialSnapshot` / `simulatePurchase` | `G(d)` cuenta sólo contribuciones futuras; `currentAmount` es informativo y no reduce spendable. |
| 14 | `goal-invariant-violated.json` | `getFinancialSnapshot` | El saldo spendable sólo incluye `isSpendable=true`; nonSpendable queda excluido. |
| 15 | `fx-bid-ask-uyu-usd.json` | `getFinancialSnapshot` / `simulatePurchase` | Activo USD→UYU usa bid floor: 100 USD = 4080.00; obligación USD→UYU usa ask ceil: 4120.00. |
| 16 | `fx-bid-ask-uyu-usd.json` | `simulatePurchase` | Disponible siempre floor; obligaciones siempre ceil, conservando el peor caso. |
| 17 | `fx-bid-ask-uyu-usd.json` (derivada sin quote) | `getFinancialSnapshot` | `PARTIAL`/`INDETERMINATE`; `totalsByCurrency` conserva importes y `convertedTotal=null`. |
| 18 | `historical-spending-uyu.json` | `getSpendingByCategory` | Quote histórico faltante ⇒ `convertedTotal=null` y warning `MISSING_HISTORICAL_FX`. |
| 19 | `historical-spending-uyu.json` (derivada) | `getSpendingByCategory` | Transacción 2026-08-01 usa quote del 01-08; jamás el quote actual del 2026-08-29. |
| 20 | `snapshot-2026-08-29-uyu.json` (derivada) | `getFinancialSnapshot` | Overdraft ⇒ `protectedCapacity=0.00` y warning `NEGATIVE_BALANCE`. |
| 21 | `snapshot-intra-month-uyu.json` (derivada) | `getFinancialSnapshot` | Inflow `ESTIMATED` no aumenta capacidad; sólo `CONFIRMED` cuenta. |
| 22 | `snapshot-2026-08-29-uyu.json` (derivada) | `getFinancialSnapshot` | Household total 12000 con split 6000 para el profile atribuye sólo 6000. |
| 23 | `historical-spending-uyu.json` (derivada) | `getSpendingByCategory` | Legacy `'súper'` mapea canónicamente a FOOD/SHOPPING; nunca por substring suelto. |
| 24 | `fx-bid-ask-uyu-usd.json` | Todas las acciones monetarias | Decimal strings y bigint; el test debe detectar que `Number('0.1')+Number('0.2') !== 0.30` y no usar float. |

Cada fila es obligatoria. Los `TODO` en el spec son los puntos donde se conectará la
implementación real del FinanceEngine.
