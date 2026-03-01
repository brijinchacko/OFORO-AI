# Oforo AI — Website

Modern, dark-themed AI company website built with Next.js 14 and Tailwind CSS. Inspired by OpenAI, Anthropic, and Perplexity design patterns.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, products, API showcase, stats |
| `/chat` | Full chat interface with model selector (ChatGPT-style) |
| `/products/ladx` | LADX AI — PLC Programming Agent |
| `/products/seekof` | SEEKOF AI — AI Discovery Marketplace |
| `/products/nxted` | NXTED AI — Career Development Agent |
| `/pricing` | Plans, API pricing, FAQs |
| `/about` | Company story, values, timeline |

## Chat Interface Features

- **Model selector**: Switch between Oforo General, Oforo Pro, LADX, SEEKOF, NXTED agents
- **Conversation sidebar**: Chat history with new/delete/search
- **Rich messages**: Markdown-style rendering with code blocks
- **Typing indicator**: Animated dots during "AI thinking"
- **Suggestion cards**: Quick-start prompts on welcome screen
- **Responsive**: Full mobile support with slide-out sidebar

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion + CSS animations
- **Icons**: Lucide React
- **Typography**: Inter + JetBrains Mono

## Deployment

```bash
npm run build    # Production build
npm start        # Start production server
```

Deploy to Vercel:
```bash
npx vercel
```

## Customisation

- **Colors**: Edit `tailwind.config.ts` → `theme.extend.colors`
- **Models**: Edit `src/app/chat/page.tsx` → `models` array
- **Products**: Edit `src/app/page.tsx` → `Products` component
- **Pricing**: Edit `src/app/pricing/page.tsx` → `plans` array

## Monetisation Strategy

1. **Freemium SaaS**: Free tier → Pro ($29/mo) → Team ($79/mo) → Enterprise (custom)
2. **API-as-a-Service**: Per-token pricing for all 3 agents via unified API
3. **Marketplace Commission**: SEEKOF earns referral fees from AI tool vendors
4. **Enterprise Licensing**: On-premise deployment with annual contracts
5. **Certification Revenue**: NXTED verified certifications as paid add-ons
6. **White-label**: License Oforo agents to other platforms

---

Built with care for Oforo Ltd, Milton Keynes, UK.
