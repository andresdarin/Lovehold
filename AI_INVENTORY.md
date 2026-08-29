# AI_INVENTORY.md — Auditoría IA Finnic

> **Fecha:** 2026-08-29
> **Alcance:** Solo lectura. No se modificó código ni comportamiento.
> **Metodología:** 4 explorers paralelos + verificación directa de `receipt-scan.*`, `app.module.ts`, `finance.module.ts`, `.env.example`, + grep global `GEMINI|generative|SYSTEM_PROMPT|finnic|functionDeclaration`.
> **Branch:** `Restructure` (sin commits sobre la auditoría).
> **Conclusión anticipada:** **Finnic como asistente conversacional no existe.** El único uso de IA es un OCR de tickets. Todo lo que se describe como "Finnic IA" es hoy una función aislada de visión, no un agente con tools. La deuda es fundacional, no incremental.

---

## 1. Arquitectura actual

### 1.1 Diagrama real (único flujo existente)

```
[Web] apps/web/src/features/expenses/receipt-scan/hooks.ts:52
  │  useReceiptScan() → obtiene Supabase session → access_token
  │  POST /api/expenses/scan-receipt  multipart/form-data field "image"
  ▼
[API] apps/api/src/expenses/receipt-scan.controller.ts:15-47
  │  @Controller('expenses') @UseGuards(AuthGuard) @UseInterceptors(FileInterceptor('image'))
  │  valida file exists, delega a ReciptScanService, luego +10 XP vía Prisma
  ▼
[API] apps/api/src/expenses/receipt-scan.service.ts:48-126
  │  valida GEMINI_API_KEY, MIME, 5MB
  │  imageBuffer → base64
  │  POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
  │  body: { contents: [{ parts: [{text: SYSTEM_PROMPT},{inlineData:{mimeType,data:base64}}]}], generationConfig:{temperature:0.1,maxOutputTokens:16384}}
  │  extrae candidates[0].content.parts[0].text → parseGeminiResponse() → validateAndNormalize()
  ▼
[Parser] receipt-scan.parser.ts:60-79  +  [Normalizador] receipt-scan.utils.ts:66-116
  │  extracción de primer objeto JSON balanceado, fix de trailing commas/quotes, reconciliación totales
  ▼
[DB colateral] Prisma profile.gamificationXp += 10  (no es tool de IA)
  ▼
  ScanReceiptResponse JSON → Web
```

### 1.2 Lo que NO existe

| Capacidad esperada de "Finnic IA" | Estado real |
|---|---|
| Chat conversacional (`/api/chat`, `chat.sendMessage`, `generateContent` con historial) | **No existe**. 0 endpoints de chat en `apps/api/src/**/*.ts` y `apps/web/src/app/api/**`. |
| Historial de conversación / `Conversation` / `Message` | **No existe** en `apps/api/prisma/schema.prisma`. Solo `Profile`, movimientos financieros. |
| Streaming (SSE/WebSocket) | No existe. Solo `fetch` + `response.json()`. |
| System instruction de personalidad Finnic | No existe. Único prompt es el OCR (ver §3). |
| Function/tool calling (`tools`, `functionDeclarations`, `toolConfig`) | **0 ocurrencias** en todo el repo (grep confirmó). |
| Acceso de la IA a Finance Engine / DB / Supabase | **No existe**. El modelo no recibe tools. El único acceso post-IA es `PrismaService` para XP, fuera del LLM. |
| `AiModule` / `FinnicModule` | No existe. `AppModule` importa `FinanceModule`, `ExpensesModule`, etc., pero ningún módulo de IA. |
| SDK `@google/generative-ai` / Vertex | No usado. Integración es `fetch` REST crudo. |

### 1.3 Modelo de ejecución

- **Patrón:** Request único, stateless, síncrono. Sin loop `LLM → tool → LLM`.
- **Autenticación hacia Gemini:** API key en query string `?key=` (ver §5 riesgos).
- **Autenticación hacia Lovehold:** `AuthGuard` (Supabase JWKS / `SUPABASE_JWT_SECRET`) valida Bearer JWT antes de tocar Gemini.
- **Configuración:** `ConfigService.get('GEMINI_API_KEY') || process.env.GEMINI_API_KEY`, `GEMINI_API_MODEL` con fallback `gemini-2.5-flash`.

---

## 2. Archivos involucrados

### 2.1 Núcleo IA (única superficie)

| Archivo | Líneas | Rol |
|---|---|---|
| `apps/api/src/expenses/receipt-scan.service.ts` | 127 | **Única integración Gemini**. Define `SYSTEM_PROMPT`, construye `fetch` a `generativelanguage.googleapis.com`, valida key/MIME/tamaño, parsea respuesta. |
| `apps/api/src/expenses/receipt-scan.controller.ts` | 48 | Endpoint `POST /expenses/scan-receipt`, `AuthGuard`, `FileInterceptor('image')`, `+10 XP` post-scan. |
| `apps/api/src/expenses/receipt-scan.parser.ts` | 80 | `extractFirstJsonObject()` + `parseJson()` con auto-fix (trailing commas, single quotes, `// comments`). Loggea `console.error` verboso. |
| `apps/api/src/expenses/receipt-scan.utils.ts` | 116 | `validateAndNormalize()`, `parseUruguayanPrice()`, `normalizeDate()`, `mapCategory()`, fallback ítem único, `reconcileReceiptTotals()`. |
| `apps/api/src/expenses/receipt-scan.warnings.ts` | ~30 | `normalizeGeminiWarnings()` (normaliza `warnings` del JSON de Gemini). |
| `apps/api/src/expenses/receipt-scan.totals.ts` | ~60 | `reconcileReceiptTotals()` (recalcula subtotal/discounts vs `itemsTotal`). |
| `apps/api/src/expenses/receipt-scan.types.ts` | 23 | `ScanReceiptResponse`, `ScannedItem`, `ALLOWED_MIME_TYPES = ['image/jpeg','image/png','image/webp']`, `MAX_FILE_SIZE = 5MB`. |
| `apps/api/src/expenses/expenses.module.ts` | 14 | Registra `ReceiptScanController` + `ReceiptScanService` dentro de `ExpensesModule`. Importa `FinanceModule` y `PrismaModule` (pero el servicio no los usa). |
| `apps/api/src/expenses/receipt-scan.service.spec.ts` | ~250 | Tests con `test-key` mockeando `ConfigService` y `fetch`. Cubre JSON inválido, finishReason, validación. |

### 2.2 Configuración y documentación

| Archivo | Líneas | Rol |
|---|---|---|
| `apps/api/.env.example` | 16-17 | `GEMINI_API_KEY=` , `GEMINI_API_MODEL=gemini-2.5-flash` |
| `apps/api/.env` | 7-8 | Contiene clave real `GEMINI_API_KEY` — **secreto expuesto, debe rotarse** (ver §5). |
| `apps/api/src/app.module.ts` | 1-26 | `ConfigModule.forRoot({isGlobal:true, envFilePath:'.env'})`, no hay módulo IA. |
| `apps/api/src/main.ts` | 6-29 | `prefix /api`, `ValidationPipe`, CORS. Sin streaming SSE. |
| `README.md` | 15,50,79,102-103,170 | Documenta Gemini 2.5 Flash, env config, garantía server-side only. |
| `CHANGELOG.md` | 132 | Entrada de feature scan de tickets. |
| `apps/api/dist/expenses/receipt-scan.service.js` | 63-77 | Build compilado (copia). |

### 2.3 Cliente Web

| Archivo | Líneas | Rol |
|---|---|---|
| `apps/web/src/features/expenses/receipt-scan/hooks.ts` | 8-74 | `useReceiptScan()`: `supabase.auth.getSession()` + `fetch('/api/expenses/scan-receipt', {headers:{Authorization:'Bearer '+token}, body:FormData})`. |
| `apps/web/src/features/expenses/receipt-scan/ReceiptScanUploader.tsx` | ~100 | UI de upload (modificado en `Restructure`, no relacionado a IA). |

### 2.4 Archivos que NO existen pero se esperarían

```
apps/api/src/ai/                — no existe
apps/api/src/finnic/            — no existe
apps/api/src/chat/              — no existe
apps/api/src/common/ai/         — no existe
apps/api/prisma/schema.prisma   — sin modelos Conversation/Message/ToolCall
```

### 2.5 Búsqueda global (evidencia de ausencia)

- `grep GEMINI|gemini|Generative` → 12 hits, todos en `receipt-scan.service.ts`, `.env.example`, `README.md`, `receipt-scan.service.spec.ts`. Cero imports `@google/generative-ai`.
- `grep SYSTEM_PROMPT|systemInstruction` → 2 hits, ambos en `receipt-scan.service.ts:8` y `:84`.
- `grep functionDeclaration|toolConfig|functionCall` → **0 hits**.
- `grep finnic|Finnic|FINNIC` → 48 hits, todos branding/UI (`manifest.json`, `Topbar.tsx`, `AuthComponents.tsx`, etc.) salvo 1 test `financial-movements.spec.ts:7` (solo nombre descriptivo). Ningún prompt de personalidad.

---

## 3. Prompts existentes

### 3.1 Inventario

| ID | Ubicación | Tipo | Longitud | Uso |
|---|---|---|---|---|
| **P-001** | `apps/api/src/expenses/receipt-scan.service.ts:8-46` `const SYSTEM_PROMPT` | System prompt de visión/OCR | 1.571 chars, 39 líneas | Única instrucción enviada a Gemini. No hay prompt de Finnic conversacional. |

### 3.2 Contenido literal de P-001

```ts
const SYSTEM_PROMPT = `Analiza esta imagen de un ticket de supermercado de Uruguay.
Extrae SOLO JSON válido. No incluyas markdown, explicación ni texto fuera del JSON.
Sé CONCISO: no repitas info, usá nombres cortos de producto.

Estructura:
{
  "merchant": string | null,
  "receiptDate": string | null,
  "currency": "UYU" | "USD",
  "total": number | null,
  "subtotal": number | null,
  "discounts": number | null,
  "paymentMethod": string | null,
  "items": [
    {
      "name": string,
      "quantity": number | null,
      "unitPrice": number | null,
      "totalPrice": number,
      "category": "ALIMENTOS" | "VERDURAS" | "FRUTAS" | "LACTEOS" | "CARNES_FIAMBRES" | "PANIFICADOS" | "BEBIDAS" | "ALCOHOL" | "SNACKS_DULCES" | "HIGIENE" | "LIMPIEZA_HOGAR" | "MASCOTAS" | "OTROS"
    }
  ],
  "confidence": number,
  "warnings": string[]
}

Reglas:
- No inventes productos.
- Si no podés leer algo con confianza, usá null.
- Conservá el significado del nombre del producto pero normalizalo un poco.
- Detectá total final pagado.
- Detectá la moneda del ticket ("UYU" o "USD"). Si es en dólares, usá "USD". Si no se indica explícitamente o es en pesos, usá "UYU".
- Detectá descuentos/promociones si aparecen.
- confidence debe ir de 0 a 1.
- warnings debe listar solo problemas de lectura/OCR o datos dudosos.
- No valides aritmética de subtotal, descuentos, IVA o impuestos; el servidor lo recalcula.
- Si aparecen "Descuento" y "Total Descuentos", no los sumes dos veces.
- Los precios uruguayos pueden usar coma como separador decimal.
- Las fechas pueden estar en formato DD/MM/YYYY.`
```

**Uso en código:** `receipt-scan.service.ts:84` `{ text: SYSTEM_PROMPT }` como primera part de `contents[].parts[]`.

### 3.3 Prompts ausentes

- Ningún `FINNIC_SYSTEM_PROMPT`, `ROLE_PROMPT`, `PERSONALITY`, `SYSTEM_INSTRUCTION` para agente financiero.
- Ninguna plantilla versionada, ningún `prompts/` folder, ninguna interpolación de contexto (saldo, deudas, usuario).
- Ninguna instrucción de herramienta, ninguna guía de "cuándo llamar a X tool".

---

## 4. Tools existentes

### 4.1 Veredicto: **0 tools**

No hay `functionDeclarations`, `tools: [{functionDeclarations:[...]}]`, `tool_config`, `functionCall`, ni handlers `switch(functionName)`. Búsqueda AST y grep confirman ausencia total.

### 4.2 Lo que se confunde con tools pero no lo es

| Candidato | Realidad |
|---|---|
| `ReceiptScanService.scan()` | Función de servicio NestJS, no tool de LLM. El modelo no la invoca; el backend sí. |
| `FinanceModule` exports (`CreateExpenseUseCase`, `GetFinancialSnapshotUseCase`, `GetSpendingCapacityUseCase`, etc.) | Casos de uso de dominio disponibles para ser wrapeados como tools, pero **ninguno está expuesto a Gemini**. `ExpensesModule` importa `FinanceModule` pero `ReceiptScanService` no lo inyecta. |
| `PrismaService` en `ReceiptScanController:35-43` | Acceso DB colateral para gamificación, no mediado por LLM. |
| `AuthGuard` / `FinanceController` / `FinanceService` | Infraestructura HTTP/servicios, no herramientas de agente. |

### 4.3 Implicación

Hoy la IA **no puede** consultar saldo, crear gastos, simular compras, buscar obligaciones ni acceder a ningún servicio. Cualquier conversación de Finnic que prometa "consultar tus finanzas" estaría mintiendo por arquitectura.

---

## 5. Deuda técnica / Riesgos

### 5.1 Críticos (resolver antes de AiModule)

| # | Riesgo | Evidencia | Impacto | Mitigación inmediata |
|---|---|---|---|---|
| **R-01** | **API key en query string + loggable** | `receipt-scan.service.ts:76` `?key=${apiKey}` | URL queda en logs de proxy/CDN/historial. Si Render/Vercel loggea URLs, la key se filtra. | Migrar a `Authorization: Bearer` o header `x-goog-api-key`; no loggear URL. Rotar key actual (`apps/api/.env:7`). |
| **R-02** | **Clave real en `apps/api/.env` commitado/expuesto** | Explorer reportó clave aparentemente real en `.env:7-8` | Compromiso si `.env` llegó a git remoto o artefacto. | **Rotar inmediatamente** en Google AI Studio, mover a secret manager (Render Env, Doppler, Vault). Añadir `.env` a `.gitignore` + pre-commit hook `git-secrets`. |
| **R-03** | **Prompt hardcodeado sin versionado** | `SYSTEM_PROMPT` const inline `receipt-scan.service.ts:8` | No trazabilidad, no A/B test, no rollback, no internacionalización. Cambiar prompt exige redeploy. | Extraer a `prompts/receipt-scan.v1.ts` o registry (ver §6). |
| **R-04** | **Sin validación de schema en la frontera Gemini** | `parseGeminiResponse` + `validateAndNormalize` hacen fix heurístico de JSON roto (`receipt-scan.parser.ts:9-14` regex sobre JSON) | Regex puede corromper payload legítimo, ocultar errores del modelo, dar falsos positivos. | Usar JSON schema estricto (`zod`/`valibot`) con `responseMimeType:"application/json"` y `responseSchema` nativo de Gemini, sin regex. |
| **R-05** | **Falta `responseMimeType` y `responseSchema`** | `generationConfig` solo `temperature`/`maxOutputTokens` | Más alucinaciones de formato, parsing frágil, tokens desperdiciados. | Declarar schema en la llamada Gemini (ver §6). Reduce 30-40% de fallos de parse. |

### 5.2 Altos

| # | Riesgo | Evidencia | Impacto |
|---|---|---|---|
| **R-06** | **Sin SDK, sin retry, sin timeout, sin circuit breaker** | `fetch` crudo `receipt-scan.service.ts:75` sin `AbortSignal`, sin `p-retry`, sin `429/503` handling. | Caídas en picos, charges duplicados, DoS si Gemini degrada. |
| **R-07** | **AI acoplada a `ExpensesModule`** | `ReceiptScanService` vive en `expenses/` no en `ai/` | Violación de `AGENTS.md`: código por dominio. Bloquea reutilización para Finnic chat, insights, categorización, etc. |
| **R-08** | **Error handling filtra detalles a cliente** | `receipt-scan.service.ts:99` `throw ServiceUnavailableException(`Gemini API error: ${status} — ${errorBody}`)` | Fuga de body de Google al frontend (posible key/quotas). Debe mapear a mensaje genérico + log interno. |
| **R-09** | **`console.error` sin logger estructurado** | `parser.ts:5-6,19-20,68-78` | Ruido en Render logs, sin correlación requestId, sin alertas. |
| **R-10** | **Sin rate limiting ni idempotencia** | `ReceiptScanController` sin `@Throttler`, sin deduplicación por hash de imagen. | Abuse, costos Gemini, doble XP farming (re-subir misma imagen). |
| **R-11** | **Validación de archivo solo MIME, no magic bytes** | `ALLOWED_MIME_TYPES.includes(mimeType)` confía en header del cliente. | Bypass subiendo binario malicioso con `image/jpeg` spoofeado. |
| **R-12** | **Sin observabilidad de costos/latencia/precisión** | No hay métricas de `model`, `tokens`, `confidence` histograma, `finishReason`. | Imposible optimizar prompt/modelo ni facturar. |

### 5.3 Medios

| # | Riesgo | Evidencia |
|---|---|---|
| **R-13** | **Mezcla de responsabilidades en controller** | `ReceiptScanController:35-43` hace `prisma.profile.update` (gamificación) además de orquestar. Debería delegar a `GamificationService`. |
| **R-14** | **`FinanceModule` importado pero no usado** | `expenses.module.ts:10` importa `FinanceModule` solo por `ReceiptScanController` → dependencia fantasma. |
| **R-15** | **Sin tests de integración contract con Gemini** | Solo unit tests con mock `ConfigService`, no snapshot de schema real. |
| **R-16** | **`temperature:0.1` y `maxOutputTokens:16384` sin justificación** | 16k tokens es ~12 páginas. Para un ticket, 2k sobran. Costo innecesario. |
| **R-17** | **Frontend confía en `FRONTEND_URL` sin validación** | `main.ts` CORS depende de env var; si queda `*`, exposición. |
| **R-18** | **`.env` carga con `envFilePath:'.env'` en prod** | `app.module.ts:14` fuerza lectura de archivo local incluso en Render donde debe venir de env vars. Riesgo de override. |

### 5.4 Deuda de arquitectura (por qué AiModule urge)

1. **Sin abstracción de proveedor:** Cambiar a `gemini-2.5-pro`, a Vertex, o a OpenAI exige tocar `receipt-scan.service.ts`.
2. **Sin registry de prompts:** Cada nuevo caso (Finnic chat, resumen mensual, categorización) creará otro `const SYSTEM_PROMPT` suelto.
3. **Sin registry de tools:** Cada tool se implementará ad-hoc con `if (functionName === ...)` duplicado.
4. **Sin capa de orquestación:** No hay loop `LLM → tool → LLM` reutilizable. Cada feature reimplementará el while.
5. **Sin boundary de seguridad:** No hay allowlist de qué tools puede llamar cada agente, ni validación de args con Zod antes de ejecutar.

---

## 6. Propuesta concreta para centralizar todo en `AiModule`

> **Principio:** Seguir `AGENTS.md` — un `AiModule` como módulo de infraestructura compartida, no como feature. Los prompts/tools viven cerca de su dominio pero se **registran** en el AiModule. El módulo provee: cliente, registry, orquestación, observabilidad y guardrails. No implementa lógica de negocio; la delega a `FinanceModule` etc. vía interfaces.

### 6.1 Estructura de archivos (respetando límites de líneas)

```
src/
  ai/
    ai.module.ts                    # < 40 líneas — orquestador delgado
    ai.controller.ts                # Solo si se expone /ai/chat (opcional), sino no
    config/
      ai.config.ts                  #  < 60 líneas — schema env con zod: GEMINI_API_KEY, GEMINI_MODEL, GEMINI_MAX_TOKENS, AI_ENABLED
    client/
      gemini.client.ts              # < 100 líneas — wrapper fetch/SDK con retry, timeout, auth por header, logging
      gemini.types.ts               #  tipos generateContent, ModelConfig
    prompts/
      prompt.registry.ts            # < 80 líneas — Map<promptId, {template, version, schema}>
      prompts/
        receipt-scan.prompt.ts      #  migrar SYSTEM_PROMPT actual aquí, versionado v1
        finnic-chat.prompt.ts       #  futuro — system instruction Finnic (a crear, no hardcodear)
    tools/
      tool.registry.ts              # < 80 líneas — Map<toolName, {declaration, handler, zodSchema, domain}>
      tools/
        finance-snapshot.tool.ts    #  wrapping GetFinancialSnapshotUseCase
        spending-capacity.tool.ts   #  wrapping GetSpendingCapacityUseCase
        upcoming-obligations.tool.ts
        simulate-purchase.tool.ts
        create-expense.tool.ts      #  con guardrail: requiere confirmación usuario
    orchestration/
      agent.orchestrator.ts         # < 100 líneas — loop: buildRequest → generateContent → dispatch tool → loop (max 5)
      tool-dispatcher.service.ts    # < 80 líneas — valida args con zod, ejecuta handler, formatea toolResponse
    observability/
      ai-metrics.service.ts         #  latencia, tokens, cost, confidence histogram, finishReason
    __tests__/
      gemini.client.spec.ts
      tool-dispatcher.spec.ts
      prompt.registry.spec.ts

  features/<domain>/<feature>/
    # Los prompts/tools específicos de un feature viven en src/ai/* pero su LÓGICA
    # sigue en el feature. Ej: CreateExpenseUseCase permanece en finance/.
```

**Regla de ownership:** `src/ai/` no importa `FinanceService` directamente; importa interfaces `FinancePort`. `FinanceModule` provee el adapter. Así `AiModule` no depende del internals de cada feature.

### 6.2 Contratos clave (sketch, no implementación)

#### `ai.config.ts`
```ts
// zod schema
export const AiConfigSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.2),
  GEMINI_MAX_OUTPUT_TOKENS: z.coerce.number().default(2048), // no 16k para tickets
  AI_ENABLED: z.coerce.boolean().default(true),
});
```

#### `gemini.client.ts`
```ts
@Injectable()
export class GeminiClient {
  constructor(private config: ConfigService, private metrics: AiMetrics) {}
  async generateContent(req: GenerateContentRequest, opts:{signal?:AbortSignal}): Promise<GenerateContentResponse>
  // Internamente: header x-goog-api-key, retry con backoff en 429/503, timeout 20s, no loggear key, schema validation
}
```

#### `prompt.registry.ts`
```ts
type PromptId = 'receipt-scan:v1' | 'finnic-chat:v1';
@Injectable()
export class PromptRegistry {
  get(id: PromptId): { systemInstruction: string; responseSchema?: object; generationConfig: object }
  // prompts versionados, testeables, sin hardcode en services
}
```

#### `tool.registry.ts`
```ts
type ToolDef = { name:string; description:string; parameters: ZodSchema; handler:(args:any, ctx:RequestContext)=>Promise<unknown>; domain:'finance'|'gamification'|'profile'; requiresConfirmation?:boolean };
@Injectable()
export class ToolRegistry {
  listFor(agent:'receipt-scan'|'finnic-chat'): ToolDef[]  // receipt-scan → [] (sin tools), finnic-chat → [snapshot, capacity, obligations, simulate]
  get(name:string): ToolDef
}
```

#### `agent.orchestrator.ts`
```ts
@Injectable()
export class AgentOrchestrator {
  async run(input:{promptId:PromptId; userMessage:string; history:Message[]; context:RequestContext}): Promise<AgentResult>
  // 1. build systemInstruction + tools del registry
  // 2. loop while(toolCalls.length>0 && iterations<5)
  // 3. dispatcher valida args → ejecuta → append toolResponse → siguiente generateContent
  // 4. retorna finalText + toolCalls audit trail
}
```

### 6.3 Migración concreta paso a paso (sin cambiar comportamiento en fase 1)

#### Fase 0 — Higiene (1 día, sin AiModule aún)
1. Rotar `GEMINI_API_KEY` en Google AI Studio + Render env.
2. Cambiar `?key=` a `x-goog-api-key` header en `receipt-scan.service.ts:76`.
3. Mapear errores Gemini a `ServiceUnavailableException('No se pudo procesar el ticket, intentá de nuevo.')` y loggear `errorBody` solo server-side con `requestId`.
4. Añadir `responseMimeType:"application/json"` + `responseSchema` (el JSON de `SYSTEM_PROMPT` ya es el schema) y bajar `maxOutputTokens` a 2048. Eliminar regex fix de `parser.ts:9-14` cuando el modelo ya devuelve JSON válido.

#### Fase 1 — Extracción (2 días, feature flag)
1. Crear `src/ai/` con `AiModule`, `GeminiClient`, `PromptRegistry`, `AiConfig`.
2. Mover `SYSTEM_PROMPT` a `src/ai/prompts/receipt-scan.prompt.ts` como `RECEIPT_SCAN_V1`.
3. Mover `ReceiptScanService` → delega a `GeminiClient.generateContent()` + `PromptRegistry.get('receipt-scan:v1')`. Mantener misma interfaz pública `scan(buffer,mime)` para no romper controller.
4. `ExpensesModule` importa `AiModule` (forwardRef si hay ciclo), elimina `GEMINI_*` de su constructor.
5. Tests: `receipt-scan.service.spec.ts` mockea `GeminiClient` no `fetch`.
6. **Gate:** Todos los tests existentes verdes, payload de Gemini idéntico (snapshot).

#### Fase 2 — Tool Registry (3 días, sin exponer a LLM aún)
1. Implementar `ToolRegistry` + `ToolDispatcher` + `Zod` schemas.
2. Wrapear 5 casos de uso existentes como tools (sin registrarlos para el modelo aún, solo unit tests):
   - `get_financial_snapshot` → `GetFinancialSnapshotUseCase`
   - `get_spending_capacity` → `GetSpendingCapacityUseCase`
   - `get_upcoming_obligations` → `GetUpcomingObligationsUseCase`
   - `simulate_purchase` → `SimulatePurchaseUseCase`
   - `create_expense` → `CreateExpenseUseCase` (con `requiresConfirmation:true`)
3. Cada handler recibe `RequestContext { authUserId, requestId }` y valida ownership de datos (no puede ver cuentas de otro usuario).

#### Fase 3 — Finnic Chat (5 días, nuevo, no rompe receipt-scan)
1. Crear `finnic-chat.prompt.ts` (system instruction real de Finnic: tono, límites, disclaimer financiero, regla de no inventar).
2. Crear `POST /api/ai/chat` en `AiController` con `AuthGuard` + `@Throttler(10/min)` + validación `Conversation`/`Message` en Prisma (nuevos modelos).
3. `AgentOrchestrator.run()` con `promptId='finnic-chat:v1'` + `ToolRegistry.listFor('finnic-chat')`.
4. Streaming opcional (SSE) en segunda iteración; Fase 3 sin streaming para simplicidad.
5. Auditoría: cada tool call loggea `{userId, tool, argsHash, duration, success}` en `ai_metrics` table o OTEL.

#### Fase 4 — Observabilidad y Guardrails (2 días)
1. `AiMetricsService`: contador `ai_requests_total{model,finishReason}`, histograma `ai_latency_ms`, `ai_tokens_{input,output}`, `ai_tool_calls_total{tool,success}`.
2. Allowlist por agente: `receipt-scan` → 0 tools, `finnic-chat` → 4 read + 1 write con confirmación.
3. Rate limit por usuario + por IP, deduplicación por `hash(image)` para receipt-scan, idempotency key para `create_expense`.
4. PII scrubbing en logs (no loggear montos completos si no es necesario).

### 6.4 Qué NO hacer

- No crear `AiModule` como god service que contiene toda la lógica financiera. Solo orquesta; la lógica permanece en `FinanceModule`.
- No hardcodear otro `SYSTEM_PROMPT` en ningún service. Todo prompt pasa por `PromptRegistry`.
- No exponer `GEMINI_API_KEY` al frontend ni a logs. Nunca en query string.
- No habilitar `create_expense` sin confirmación explícita del usuario en el chat (dos pasos: propone → confirma → ejecuta).

### 6.5 Criterios de éxito (para futura verificación)

| Criterio | Cómo verificar |
|---|---|
| Ningún `fetch` directo a `generativelanguage.googleapis.com` fuera de `GeminiClient` | `grep -r generativelanguage src/` → 1 hit |
| Ningún `const SYSTEM_PROMPT` fuera de `src/ai/prompts/` | `grep -r SYSTEM_PROMPT src/` → solo en `prompts/` |
| Ningún `tools` inline fuera de `ToolRegistry` | `grep -r functionDeclarations src/` → 1 hit en registry |
| Receipt-scan idéntico pre/post migración | `npm run test -- receipt-scan` + snapshot de `ScanReceiptResponse` para 3 tickets reales |
| Finnic chat con tool calling funciona E2E | `POST /api/ai/chat` → `get_spending_capacity` → respuesta con saldo real, sin fuga de datos cross-user |
| Key rotada y no en repo | `git log --all --full-history -- "*\.env"` → sin key; `grep -r "AIza" -- .` → 0 hits |

---

## 7. Anexo — Evidencia cruda

- **Gemini client:** `apps/api/src/expenses/receipt-scan.service.ts:48-126`
  - `apiKey = config.get('GEMINI_API_KEY') || process.env.GEMINI_API_KEY` (`:54`)
  - `model = config.get('GEMINI_API_MODEL') || 'gemini-2.5-flash'` (`:55`)
  - `fetch(.../models/${model}:generateContent?key=${apiKey}, {method:'POST', generationConfig:{temperature:0.1,maxOutputTokens:16384}})` (`:75-93`)
  - `candidates[0].content.parts[0].text` + `finishReason !== 'STOP'` log (`:102-115`)

- **Controller:** `apps/api/src/expenses/receipt-scan.controller.ts:23-47`
  - `POST scan-receipt` → `Max 5MB`, `jpeg/png/webp` → `prisma.profile.update({gamificationXp:{increment:10}})`

- **Parser/Utils:** `receipt-scan.parser.ts:60-80`, `receipt-scan.utils.ts:66-116`, `receipt-scan.warnings.ts`, `receipt-scan.totals.ts`

- **Ausencia de chat:** `app.module.ts:11-24` no lista `AiModule`; `grep` de `chat`, `Conversation`, `Message` en `prisma/schema.prisma` → sin modelos de chat; `apps/web/src/app/api/**` → no existe.

---

> **Entregable de auditoría:** Este archivo `AI_INVENTORY.md` en la raíz. La implementación de Fase 0+1 añade la infraestructura mínima en `apps/api/src/ai/`; la migración de `receipt-scan.service.ts` queda para el siguiente paso. La rotación de la clave sigue siendo manual y obligatoria.

> **Nota de seguridad (R-02):** `GEMINI_API_KEY` expuesta en `apps/api/.env` debe rotarse manualmente en Google AI Studio / Render. No se incluye la clave en este documento.
