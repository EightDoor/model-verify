[**English** | [中文](./README.md)]

# Model Verify — LLM API Model Fingerprint Verification Tool

A black-box LLM API verification tool that detects model substitution in relay/proxy endpoints. It sends "name a random number between 1 and 100" requests to both a baseline (official) and a target (relay) endpoint, then computes Jensen-Shannon divergence between the output distributions to determine whether the relay is actually serving the advertised model.

> Based on: [*One Token Is Enough: Fingerprinting and Verifying Large Language Models from Single-Token Output Distributions*](https://arxiv.org/abs/2607.10252) (2026)

---

## Features

- **Dual-endpoint comparison**: probes baseline and target APIs concurrently with batched parallel requests
- **OpenAI & Anthropic compatible**
- **JSD scoring**: objective Jensen-Shannon Divergence metric with Laplacian smoothing
- **Distribution visualization**: overlaid bar chart comparing number preferences
- **Secure**: API keys stay on the server (Serverless proxy), never exposed to the browser; SSRF protection on URLs
- **Stateless**: no database required — open and use

## Quick Start

```bash
npm install
npm run dev     # local development
npm run build   # production build
npm test        # run unit tests (21 tests)
```

## Deploy to Vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fmodel-verify)

One-click deploy (fork the repo first and replace `your-username` in the link above):

```bash
# Or deploy via CLI
npx vercel
```

> **Note**: Vercel Hobby plan has a 10s function timeout — use 30-50 samples. Pro plan (60s timeout) handles the full 100.

## Usage

1. Fill in the **Baseline (Official API)** config: Provider, Base URL, API Key, Model
2. Fill in the **Target (Relay API)** config
3. Adjust Samples (default: 50 per endpoint)
4. Click **Start Verification**
5. Wait for results — JSD score + distribution chart + verdict

### Verdict Guide

| JSD Range | Verdict | Meaning |
|-----------|---------|---------|
| ≤ 0.15 | PASS | Distributions match, model identity verified |
| 0.15 – 0.3 | SUSPECT | Some divergence — retry or increase samples |
| ≥ 0.3 | FAIL | Significant divergence — likely model substitution |

## Project Structure

```
model-verify/
├── app/
│   ├── page.tsx               # Main page (idle→probing→done→error state machine)
│   ├── layout.tsx             # Layout + metadata
│   └── api/probe/route.ts     # POST /api/probe (SSRF-safe, concurrent dual-endpoint probing)
├── components/
│   ├── config-form.tsx        # API config form (frontend URL validation)
│   ├── progress-panel.tsx     # Loading/error state indicator
│   ├── distribution-chart.tsx # recharts overlaid bar chart
│   └── result-panel.tsx       # JSD score + Verdict badge + sample quality warnings
├── lib/
│   ├── types.ts               # Type definitions & constants
│   └── fingerprint/
│       ├── prompts.ts          # Probe prompts + number extractor
│       ├── jsd.ts              # JSD algorithm (Laplacian-smoothed KL divergence)
│       ├── providers.ts        # OpenAI/Anthropic adapters (raw fetch, no SDK)
│       └── probe.ts           # Batched parallel probe dispatch
├── __tests__/
│   ├── jsd.test.ts            # JSD + Verdict unit tests (11 tests)
│   └── prompts.test.ts        # Prompt rotation + extraction tests (10 tests)
└── docs/superpowers/plans/
    └── 2026-07-22-model-verify.md  # Implementation plan
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Charts**: recharts
- **Deployment**: Vercel Serverless Functions

## How It Works

Based on the methodology from *One Token Is Enough* (2026):

1. Send **50-100 "random number 1-100" requests** to both endpoints
2. Collect returned numbers, build a **frequency distribution** for each side
3. Compute **Jensen-Shannon Divergence** (Laplacian smoothed) between the two distributions
4. **JSD ≤ 0.15** → models match; **≥ 0.3** → likely substitution

Each probe costs a single output token. Total audit cost: **~$0.01-0.05**. No classifier training or white-box access required.
