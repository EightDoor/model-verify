[[English](./README.en.md) | **中文**]

# Model Verify — LLM API 模型真伪检测工具

基于单 token 随机数指纹的 LLM API 中转站模型真伪检测工具。发送 "请说出 1 到 100 之间的一个随机数" 请求，通过 Jensen-Shannon 散度比较官方 API 与中转站 API 的输出分布，判断中转站是否真实运行了声称的模型。

> 参考论文：[*One Token Is Enough: Fingerprinting and Verifying Large Language Models from Single-Token Output Distributions*](https://arxiv.org/abs/2607.10252) (2026)

---

## 功能特性

- **双端对比探测**：同时配置官方 API 和中转站 API，双端并行采样
- **OpenAI / Anthropic 双协议支持**
- **JSD 量化评分**：基于 Jensen-Shannon Divergence 的客观模型身份判定
- **分布可视化**：双端随机数选择分布叠加柱状图
- **安全**：API Key 仅经 Serverless Function 代理，不暴露到浏览器
- **无状态**：无需数据库，打开即用

## 快速开始

```bash
npm install
npm run dev    # 本地开发
npm run build  # 构建
npm test       # 运行测试
```

## 部署到 Vercel

```bash
npx vercel deploy
```

> **注意**：Vercel Hobby 计划 Serverless Functions 超时 10s，建议 Samples 设为 30-50；Pro 计划超时 60s，可跑满 100。

## 使用方法

1. 填入 **Baseline（官方 API）** 配置：Provider、Base URL、API Key、Model
2. 填入 **Target（中转站 API）** 配置
3. 调节 Samples（每端采样数，默认 50）
4. 点击 **Start Verification**
5. 等待探测完成，查看 JSD 分数和分布对比图

### Verdict 判定标准

| JSD 范围 | 判定 | 含义 |
|----------|------|------|
| ≤ 0.15 | PASS | 两端分布一致，模型身份可信 |
| 0.15 ~ 0.3 | SUSPECT | 存在差异，建议重试或增加 Samples |
| ≥ 0.3 | FAIL | 分布差异显著，模型可能被替换 |

## 项目结构

```
model-verify/
├── app/
│   ├── page.tsx               # 主页面（状态机 idle→probing→done→error）
│   ├── layout.tsx             # 布局 + 元数据
│   └── api/probe/route.ts     # POST /api/probe (SSRF 防护 + 双端并发探测)
├── components/
│   ├── config-form.tsx        # API 配置表单（前端 URL 校验）
│   ├── progress-panel.tsx     # 探测进度指示器
│   ├── distribution-chart.tsx # recharts 分布对比柱状图
│   └── result-panel.tsx       # JSD 结果 + Verdict + 样本质量警告
├── lib/
│   ├── types.ts               # 类型定义与常量
│   └── fingerprint/
│       ├── prompts.ts          # 探测 prompt + 数字提取器
│       ├── jsd.ts              # JSD 算法（Laplacian 平滑）
│       ├── providers.ts        # OpenAI/Anthropic 适配器（fetch 直连）
│       └── probe.ts           # 探测调度（批处理并行）
├── __tests__/
│   ├── jsd.test.ts            # JSD + Verdict 单元测试
│   └── prompts.test.ts        # prompt 轮转 + 数字提取测试
└── docs/superpowers/plans/
    └── 2026-07-22-model-verify.md  # 实施计划
```

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS 4
- **图表**: recharts
- **部署**: Vercel Serverless Functions

## 设计原理

核心方法来自论文 *One Token Is Enough*（2026）：

1. 向两端各发送 **50-100 次** "请说出 1 到 100 之间的随机数" 请求
2. 收集每次返回的数字，统计 **频率分布**
3. 使用 **Jensen-Shannon Divergence**（带 Laplacian 平滑）量化分布差异
4. JSD **≤ 0.15** → 模型一致；**≥ 0.3** → 极可能被替换

优势：每次探测只需单 token 输出，总成本约 **几美分**，无需训练分类器或白盒访问。
