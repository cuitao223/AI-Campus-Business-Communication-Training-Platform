# AI Campus Business Communication Training Platform

AI 校园商务谈判官是一款面向大学生的 AI 商务沟通训练平台。它围绕兼职谈薪、自由职业接单报价、校园创业合作、二手交易议价等真实校园经济场景，让用户和 AI 对手进行多轮谈判训练，并在训练过程中获得实时反馈、语音交互、成交判断和复盘报告。

这个项目的目标不是做一个普通聊天机器人，而是做一个可练习、可反馈、可复盘的校园商务能力训练工具。

## Product Highlights

- **校园真实场景**：覆盖兼职谈薪、接单报价、创业合作、二手交易四类高频场景。
- **AI 对手角色扮演**：AI 固定扮演雇主、甲方、商家、买家等谈判对手，不会变成泛泛而谈的助手。
- **多种对手风格**：支持友好型、怀疑型、压价型、强势型，对应不同谈判压力。
- **实时谈判热力条**：展示对方信任度、谈判压力、成交可能性、风险等级。
- **语音交互体验**：支持语音输入、AI 自动朗读、朗读声波动画。
- **终局状态判断**：成交或未达预期后自动锁定对话，避免结束后继续乱聊。
- **复盘报告**：训练结束后生成优势、不足、风险提示、改进建议和更好回复示例。
- **游戏化反馈**：根据表现生成谈判称号、训练成就、结束奖牌弹窗和成长曲线。
- **每日挑战**：首页提供高压价、兼职骗局、二手交易风险等挑战入口。

## Core Scenarios

| Scenario | Training Focus |
| --- | --- |
| 学生兼职谈薪 | 薪资、排班、试用期、结算方式、押金风险 |
| 自由职业接单报价 | 报价依据、交付范围、修改次数、付款节点 |
| 校园创业项目谈合作 | 商业模式表达、数据说服、试点合作、风险共担 |
| 二手交易议价 | 合理定价、砍价回应、验货流程、平台交易 |

## Tech Stack

| Module | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | Tailwind CSS 4 |
| Icons | lucide-react |
| Charts | Recharts |
| AI API | DeepSeek / OpenAI-compatible Chat Completions API |
| Storage | localStorage |
| Voice | Web Speech API |

## Project Structure

```text
src
├─ app
│  ├─ page.tsx                 Home page
│  ├─ scenarios/page.tsx        Scenario selection
│  ├─ setup/[scenarioId]        Training setup
│  ├─ training/[sessionId]      Chat training page
│  ├─ report/[sessionId]        Report page
│  └─ api
│     ├─ chat/route.ts          AI chat API
│     └─ report/route.ts        AI report API
├─ components                   UI and interaction components
├─ data/scenarios.ts            Scenario data
├─ lib/engine.ts                Scoring and session logic
├─ lib/engagement.ts            Titles, achievements and heat metrics
└─ types/index.ts               Type definitions
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example`:

```bash
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-v4-flash
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

## Documentation

The product introduction document is available in:

- `docs/AI校园商务谈判官作品介绍.md`
- `docs/AI校园商务谈判官作品介绍.docx`

The documentation includes product positioning, user pain points, core features, technical design, use cases, promotion value and future roadmap.

## Environment Safety

API keys should only be stored in `.env.local`. The repository ignores local environment files:

```text
.env
.env.local
.env.*.local
```

## License

This project is for learning, coursework and product demonstration purposes.
