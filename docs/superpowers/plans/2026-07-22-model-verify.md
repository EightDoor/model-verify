# Model Verify Implementation Plan

> **For agentic workers:** Inline execution in current session.

**Goal:** Build a web tool that verifies whether an LLM API relay/proxy is truly serving the claimed model, using single-token random-number fingerprinting (Jensen-Shannon divergence).

**Architecture:** Next.js 15 App Router + shadcn/ui + recharts. Serverless Functions proxy probe requests to both baseline (official) and target (relay) endpoints concurrently. JSD computed server-side; distribution charts rendered client-side with recharts.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, recharts

---

### Task 1: Scaffold Next.js project + dependencies

**Files:**
- Create: `model-verify/` (full project scaffolding)
- Create: `components/ui/` (shadcn/ui base components)

- [ ] **Step 1: Create Next.js project**

Run: `npx create-next-app@latest model-verify --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"`

- [ ] **Step 2: Install dependencies**

```bash
cd model-verify
npx shadcn@latest init -d
npx shadcn@latest add button card input label select slider badge separator -y
npm install recharts
```

### Task 2: Core library — types, prompts, JSD, providers, probe

**Files:**
- Create: `lib/types.ts`
- Create: `lib/fingerprint/prompts.ts`
- Create: `lib/fingerprint/jsd.ts`
- Create: `lib/fingerprint/providers.ts`
- Create: `lib/fingerprint/probe.ts`

- [ ] **Step 1: Create `lib/types.ts`** — shared type definitions
- [ ] **Step 2: Create `lib/fingerprint/prompts.ts`** — probe prompt templates
- [ ] **Step 3: Create `lib/fingerprint/jsd.ts`** — JSD calculation with Laplacian smoothing
- [ ] **Step 4: Create `lib/fingerprint/providers.ts`** — OpenAI/Anthropic API adapters
- [ ] **Step 5: Create `lib/fingerprint/probe.ts`** — orchestration: batch probe dispatch + result aggregation

### Task 3: API route — /api/probe

**Files:**
- Create: `app/api/probe/route.ts`

- [ ] **Step 1: Create `/api/probe` POST handler** — validate input → run concurrent probes → compute JSD → return verdict

### Task 4: Frontend components

**Files:**
- Create: `components/config-form.tsx`
- Create: `components/progress-panel.tsx`
- Create: `components/distribution-chart.tsx`
- Create: `components/result-panel.tsx`

- [ ] **Step 1: Create `config-form.tsx`** — dual-endpoint configuration form
- [ ] **Step 2: Create `progress-panel.tsx`** — probing progress with elapsed time
- [ ] **Step 3: Create `distribution-chart.tsx`** — recharts bar chart overlaying two distributions
- [ ] **Step 4: Create `result-panel.tsx`** — JSD score, verdict badge, statistical summary

### Task 5: Main page + layout

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Update `layout.tsx`** — metadata, font, providers
- [ ] **Step 2: Write `page.tsx`** — compose all components, manage state (idle → probing → done)

### Task 6: Unit tests

**Files:**
- Create: `__tests__/jsd.test.ts`
- Create: `__tests__/prompts.test.ts`

- [ ] **Step 1: Write JSD unit test** — known distributions, edge cases (identical, empty, single-value)
- [ ] **Step 2: Write prompts unit test** — prompt rotation, output validation

### Task 7: Build verification

- [ ] **Step 1: Run `npm run build`** — no errors
- [ ] **Step 2: Run `npm run lint`** — no errors
