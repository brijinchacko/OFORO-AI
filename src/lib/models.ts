export type ModelTier = "free" | "mini" | "pro" | "max";

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  openrouterModel: string;
  systemPrompt: string;
  tier: ModelTier;
  badge?: string;
}

/* ═══════════════════════════════════════
   OFORO AI SYSTEM PROMPT (shared base)
   ═══════════════════════════════════════ */
const OFORO_BASE_PROMPT = `You are Oforo AI, a helpful AI assistant built by Oforo, an AI company based in Milton Keynes, UK (a subsidiary of Wartens — www.wartens.com). Oforo Ltd is the registered company name.

You are knowledgeable, concise, and friendly. You can help with research, writing, analysis, coding, and general questions.

Oforo has three specialised AI products:
1. LADX AI — An AI agent for PLC programming and industrial automation
2. SEEKOF AI — An AI-driven global search and marketplace for discovering AI tools worldwide
3. NXTED AI — An AI-based career agent for skill assessment, learning paths, and employment guidance

Keep responses helpful, accurate, and well-formatted with markdown when appropriate.`;

const OFORO_PRO_PROMPT = `You are Oforo Pro, the advanced AI model from Oforo — an AI company based in Milton Keynes, UK (a subsidiary of Wartens — www.wartens.com).

You excel at:
- Complex multi-step reasoning
- Deep technical analysis
- Detailed research and writing
- Code generation and debugging
- Strategic thinking and planning

Provide thorough, well-structured responses. Use markdown formatting for clarity. Be precise and insightful.`;

const OFORO_MAX_PROMPT = `You are Oforo MAX, the ultimate collaborative AI from Oforo — an AI company based in Milton Keynes, UK (a subsidiary of Wartens — www.wartens.com).

You have all the capabilities of Oforo Pro plus collaboration features:
- Complex multi-step reasoning & deep analysis
- Code generation and debugging
- Strategic thinking and planning
- Real-time collaborative AI workspaces
- Shared conversations and canvas whiteboards
- Team messaging and coordination

Provide thorough, well-structured responses. Use markdown formatting for clarity. Be precise, insightful, and collaborative.`;

/* ═══════════════════════════════════════
   MODEL CONFIGS — Tiered Architecture
   ═══════════════════════════════════════

   Free (no login):    Gemini 2.0 Flash, DeepSeek V3
   Mini (free plan):   + GPT-4o mini, Llama 3.3 70B
   Pro  (paid):        + GPT-4o, Claude Sonnet 4, Grok 3, o3
   MAX  (premium):     + Claude Opus 4
   ═══════════════════════════════════════ */

export const modelConfigs: ModelConfig[] = [
  /* ── FREE TIER (no login required) ── */
  {
    id: "gemini-flash",
    name: "Gemini 2.0 Flash",
    description: "Fast & efficient",
    openrouterModel: "google/gemini-2.0-flash-001",
    tier: "free",
    systemPrompt: OFORO_BASE_PROMPT,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    description: "High quality, open-source",
    openrouterModel: "deepseek/deepseek-chat-v3-0324",
    tier: "free",
    systemPrompt: OFORO_BASE_PROMPT,
  },

  /* ── MINI TIER (free plan, requires signup) ── */
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    description: "Compact & capable",
    openrouterModel: "openai/gpt-4o-mini",
    tier: "mini",
    systemPrompt: OFORO_BASE_PROMPT,
  },
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    description: "Powerful open-source",
    openrouterModel: "meta-llama/llama-3.3-70b-instruct",
    tier: "mini",
    systemPrompt: OFORO_BASE_PROMPT,
  },

  /* ── PRO TIER (paid plan) ── */
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "OpenAI flagship",
    openrouterModel: "openai/gpt-4o",
    tier: "pro",
    systemPrompt: OFORO_PRO_PROMPT,
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet 4",
    description: "Advanced reasoning",
    openrouterModel: "anthropic/claude-sonnet-4",
    tier: "pro",
    systemPrompt: OFORO_PRO_PROMPT,
  },
  {
    id: "grok-3",
    name: "Grok 3",
    description: "xAI powerhouse",
    openrouterModel: "x-ai/grok-3-beta",
    tier: "pro",
    systemPrompt: OFORO_PRO_PROMPT,
  },
  {
    id: "o3",
    name: "o3",
    description: "Deep reasoning",
    openrouterModel: "openai/o3",
    tier: "pro",
    systemPrompt: OFORO_PRO_PROMPT,
  },

  /* ── MAX TIER (premium plan) ── */
  {
    id: "claude-opus",
    name: "Claude Opus 4",
    description: "Ultimate intelligence",
    openrouterModel: "anthropic/claude-opus-4",
    tier: "max",
    systemPrompt: OFORO_MAX_PROMPT,
  },

  /* ═══════════════════════════════════════
     PRODUCT AGENTS (internal routing only)
     Not shown in model selector dropdown
     ═══════════════════════════════════════ */
  {
    id: "ladx-agent",
    name: "LADX AI",
    description: "PLC programming & industrial automation",
    openrouterModel: "anthropic/claude-sonnet-4",
    tier: "free",
    systemPrompt: `You are LADX AI, a specialised PLC programming agent built by Oforo (www.oforo.com), a subsidiary of Wartens (www.wartens.com), based in Milton Keynes, UK.

You are an expert in industrial automation and PLC programming. Your capabilities include:

1. **Code Generation**: Generate production-ready PLC code in:
   - Ladder Logic (LD)
   - Structured Text (ST / SCL)
   - Function Block Diagram (FBD)
   - Sequential Function Chart (SFC)
   - Instruction List (IL)

2. **Multi-Vendor Support**: You can generate code for:
   - Siemens S7-1200/1500 (TIA Portal)
   - Allen-Bradley / Rockwell (Studio 5000)
   - Mitsubishi (GX Works)
   - Schneider Electric (EcoStruxure)
   - Beckhoff (TwinCAT)
   - CODESYS-based PLCs

3. **Safety & Compliance**: Always follow IEC 61131-3 standards. Flag potential safety issues. Include emergency stop logic where appropriate.

4. **Documentation**: Always include comments in generated code. Explain the logic clearly.

When generating PLC code:
- Always ask about the PLC vendor/model if not specified
- Include variable declarations
- Add inline comments explaining each section
- Consider edge cases and safety interlocks
- Provide structured, clean, maintainable code

Format code in markdown code blocks with appropriate language tags.`,
  },
  {
    id: "seekof-agent",
    name: "SEEKOF AI",
    description: "AI tool discovery & comparison",
    openrouterModel: "google/gemini-2.0-flash-001",
    tier: "free",
    systemPrompt: `You are SEEKOF AI, an AI-driven global search and marketplace agent built by Oforo (www.oforo.com), a subsidiary of Wartens (www.wartens.com), based in Milton Keynes, UK.

You are an expert on AI tools, platforms, APIs, and companies worldwide. Your capabilities include:

1. **AI Tool Discovery**: Help users find the right AI tools for their use case from a vast knowledge of AI products and services.

2. **Comparison & Analysis**: Compare AI tools side-by-side based on:
   - Features and capabilities
   - Pricing models (free, freemium, paid, enterprise)
   - API availability and documentation quality
   - User reviews and community feedback
   - Integration options
   - Performance benchmarks

3. **Category Expertise**: You know about AI tools across all categories:
   - Large Language Models (LLMs)
   - Image/Video generation
   - Code assistants
   - Voice & Audio AI
   - Data analytics & BI
   - Healthcare AI
   - Robotics & automation
   - And many more

4. **Market Intelligence**: Share insights on AI industry trends, funding rounds, new launches, and market dynamics.

Always provide structured comparisons when comparing tools. Include pricing where known. Mention both strengths and limitations of each tool. Recommend based on the user's specific needs.`,
  },
  {
    id: "nxted-agent",
    name: "NXTED AI",
    description: "Career guidance & skill assessment",
    openrouterModel: "google/gemini-2.0-flash-001",
    tier: "free",
    systemPrompt: `You are NXTED AI, an AI-based career development agent built by Oforo (www.oforo.com), a subsidiary of Wartens (www.wartens.com), based in Milton Keynes, UK.

You are an expert career coach and learning advisor. Your capabilities include:

1. **Skill Assessment**: Evaluate users' current skills through conversational assessment. Ask targeted questions to understand their proficiency levels across technical and soft skills.

2. **Personalised Learning Paths**: Based on assessment results and career goals, create customised learning journeys including:
   - Specific courses and certifications to pursue
   - Projects to build for portfolio
   - Skills to prioritise
   - Timeline estimates
   - Free and paid resource recommendations

3. **Career Guidance**: Provide advice on:
   - Career transitions
   - Industry trends and in-demand skills
   - Resume and portfolio tips
   - Interview preparation
   - Salary expectations by role and location

4. **Job Market Intelligence**: Share insights on:
   - Which skills employers are hiring for
   - Emerging job roles
   - Industry-specific requirements
   - Remote vs on-site trends

When assessing skills, use a conversational approach. Ask one question at a time. Provide actionable, specific advice. Always be encouraging while being honest about skill gaps.`,
  },

  /* ── Legacy mappings (backward compat) ── */
  {
    id: "oforo-general",
    name: "Gemini 2.0 Flash",
    description: "Fast & efficient",
    openrouterModel: "google/gemini-2.0-flash-001",
    tier: "free",
    systemPrompt: OFORO_BASE_PROMPT,
  },
  {
    id: "oforo-pro",
    name: "Claude Sonnet 4",
    description: "Advanced reasoning",
    openrouterModel: "anthropic/claude-sonnet-4",
    tier: "pro",
    systemPrompt: OFORO_PRO_PROMPT,
  },
  {
    id: "oforo-max",
    name: "Claude Opus 4",
    description: "Ultimate intelligence",
    openrouterModel: "anthropic/claude-opus-4",
    tier: "max",
    systemPrompt: OFORO_MAX_PROMPT,
  },
];

/* ── Tier display config ── */
export const tierConfig: Record<ModelTier, { label: string; color: string; bgColor: string }> = {
  free: { label: "Free", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)" },
  mini: { label: "Mini", color: "#3b82f6", bgColor: "rgba(59,130,246,0.1)" },
  pro: { label: "Pro", color: "#a855f7", bgColor: "rgba(168,85,247,0.1)" },
  max: { label: "MAX", color: "#f59e0b", bgColor: "rgba(245,158,11,0.1)" },
};

/* ── User-facing models (excludes product agents & legacy IDs) ── */
export const userModels = modelConfigs.filter(
  (m) => !["ladx-agent", "seekof-agent", "nxted-agent", "oforo-general", "oforo-pro", "oforo-max"].includes(m.id)
);

/* ── Oforo tiers shown in the top selector ── */
export type OforoTier = "mini" | "pro" | "max";

export const oforoTiers: { id: OforoTier; name: string; description: string; color: string; planRequired: string }[] = [
  { id: "mini", name: "Oforo Mini", description: "Free", color: "#3b82f6", planRequired: "free" },
  { id: "pro", name: "Oforo Pro", description: "Paid", color: "#a855f7", planRequired: "pro" },
  { id: "max", name: "Oforo MAX", description: "Premium", color: "#f59e0b", planRequired: "max" },
];

/* ── Models available per tier (cumulative) ── */
export function getModelsForTier(tier: OforoTier): ModelConfig[] {
  const tierLevels: ModelTier[] = ["free", "mini"]; // Mini tier gets free + mini
  if (tier === "pro") tierLevels.push("pro");
  if (tier === "max") tierLevels.push("pro", "max");
  return userModels.filter((m) => tierLevels.includes(m.tier));
}

/* ── Default model for each tier ── */
export function getDefaultModelForTier(tier: OforoTier): string {
  switch (tier) {
    case "mini": return "gemini-flash";
    case "pro": return "claude-sonnet";
    case "max": return "claude-opus";
  }
}

export function getModelConfig(modelId: string): ModelConfig {
  return modelConfigs.find((m) => m.id === modelId) || modelConfigs[0];
}

/* ═══════════════════════════════════════
   AUTO MODEL ROUTING
   Analyzes the user's prompt and picks the
   best model from the user's accessible tier.
   ═══════════════════════════════════════ */

type PromptCategory = "code" | "math" | "creative" | "analysis" | "general";

const CATEGORY_PATTERNS: { category: PromptCategory; patterns: RegExp[] }[] = [
  {
    category: "code",
    patterns: [
      /\b(code|coding|program|function|debug|compile|syntax|api|endpoint|script|html|css|javascript|typescript|python|java|rust|golang|react|next\.?js|sql|database|git|docker|regex|algorithm|refactor|deploy|npm|pip|import|class\s|def\s|const\s|let\s|var\s|async|await|promise|callback)\b/i,
      /```[\s\S]*```/,
      /\b(fix|bug|error|exception|stack\s?trace|console\.log|print\()\b/i,
    ],
  },
  {
    category: "math",
    patterns: [
      /\b(math|calcul|equation|formula|algebra|geometry|statistics|probability|derivative|integral|matrix|vector|proof|theorem|solve\s+(for|this|the))\b/i,
      /\b(logic|reasoning|puzzle|riddle|brain\s?teaser|step.by.step|think\s+(through|about|carefully))\b/i,
      /[=+\-*/^]{2,}|\d+\s*[+\-*/^]\s*\d+/,
    ],
  },
  {
    category: "creative",
    patterns: [
      /\b(write|story|poem|essay|blog|article|creative|fiction|novel|chapter|lyric|song|slogan|tagline|script|dialogue|character|plot|narrative|tone|style|rewrite|rephrase|paraphrase)\b/i,
      /\b(email|letter|proposal|pitch|resume|cover\s?letter|bio|description|caption|headline|title|name\s+ideas?|brainstorm)\b/i,
    ],
  },
  {
    category: "analysis",
    patterns: [
      /\b(analy[sz]|compare|contrast|evaluate|assess|review|critique|pros?\s+and\s+cons?|advantages?\s+and\s+disadvantages?|strengths?\s+and\s+weaknesses?|trade.?offs?)\b/i,
      /\b(research|study|report|summarize|summary|explain\s+(how|why|what)|deep\s+dive|in.depth|comprehensive|detailed)\b/i,
      /\b(strategy|plan|architecture|design\s+system|framework|approach|methodology|best\s+practices?)\b/i,
    ],
  },
];

function categorizePrompt(text: string): PromptCategory {
  const scores: Record<PromptCategory, number> = { code: 0, math: 0, creative: 0, analysis: 0, general: 0 };

  for (const { category, patterns } of CATEGORY_PATTERNS) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) scores[category] += matches.length;
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? (best[0] as PromptCategory) : "general";
}

/* Model preference per category, ordered by priority (best first) */
const CATEGORY_MODEL_PREFS: Record<PromptCategory, string[]> = {
  code:     ["claude-sonnet", "deepseek-v3", "gpt-4o", "claude-opus", "gpt-4o-mini", "gemini-flash"],
  math:     ["o3", "claude-opus", "claude-sonnet", "gpt-4o", "deepseek-v3", "gemini-flash"],
  creative: ["gpt-4o", "claude-sonnet", "claude-opus", "gpt-4o-mini", "gemini-flash", "deepseek-v3"],
  analysis: ["claude-sonnet", "claude-opus", "gpt-4o", "o3", "deepseek-v3", "gemini-flash"],
  general:  ["gemini-flash", "gpt-4o-mini", "deepseek-v3", "llama-3.3-70b", "gpt-4o", "claude-sonnet"],
};

export function autoRouteModel(prompt: string, tier: OforoTier): { modelId: string; category: PromptCategory; reason: string } {
  const category = categorizePrompt(prompt);
  const available = getModelsForTier(tier);
  const availableIds = new Set(available.map((m) => m.id));
  const prefs = CATEGORY_MODEL_PREFS[category];

  const modelId = prefs.find((id) => availableIds.has(id)) || getDefaultModelForTier(tier);

  const reasons: Record<PromptCategory, string> = {
    code: "Best for code",
    math: "Best for reasoning",
    creative: "Best for writing",
    analysis: "Best for analysis",
    general: "Fast & efficient",
  };

  return { modelId, category, reason: reasons[category] };
}
