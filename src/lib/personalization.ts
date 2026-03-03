/**
 * User Personalization — Client-side learning system
 *
 * Tracks user interests, knowledge level, and conversation patterns
 * from their messages, then builds a context string that gets injected
 * into the AI system prompt for personalized responses.
 */

const STORAGE_KEY = "oforo-user-profile";

export interface UserInterest {
  topic: string;
  count: number;
  lastSeen: number; // timestamp
}

export interface UserProfile {
  interests: UserInterest[];
  knowledgeAreas: string[]; // topics user has demonstrated knowledge in
  preferredStyle: "concise" | "detailed" | "technical" | "casual";
  messageCount: number;
  lastUpdated: number;
}

const DEFAULT_PROFILE: UserProfile = {
  interests: [],
  knowledgeAreas: [],
  preferredStyle: "detailed",
  messageCount: 0,
  lastUpdated: Date.now(),
};

/* ── Topic extraction patterns ── */
const TOPIC_PATTERNS: { topic: string; patterns: RegExp[] }[] = [
  { topic: "Web Development", patterns: [/\b(react|next\.?js|vue|angular|html|css|tailwind|frontend|web\s*dev|dom|jsx|tsx|webpack|vite)\b/i] },
  { topic: "Backend Development", patterns: [/\b(node\.?js|express|fastify|django|flask|spring|api|rest|graphql|server|backend|microservice)\b/i] },
  { topic: "Python", patterns: [/\b(python|pip|pandas|numpy|matplotlib|jupyter|flask|django|pytorch|tensorflow)\b/i] },
  { topic: "JavaScript/TypeScript", patterns: [/\b(javascript|typescript|es6|es2|npm|yarn|bun|deno)\b/i] },
  { topic: "Machine Learning", patterns: [/\b(machine\s*learning|deep\s*learning|neural\s*net|ai\s*model|training|dataset|classification|regression|transformer|llm|gpt|bert|fine.tun)\b/i] },
  { topic: "Data Science", patterns: [/\b(data\s*science|data\s*analy|statistics|visualization|csv|excel|sql|database|etl|data\s*pipeline)\b/i] },
  { topic: "DevOps & Cloud", patterns: [/\b(docker|kubernetes|aws|azure|gcp|ci.cd|deploy|terraform|ansible|nginx|linux|server)\b/i] },
  { topic: "Mobile Development", patterns: [/\b(react\s*native|flutter|swift|kotlin|ios|android|mobile\s*app|expo)\b/i] },
  { topic: "Databases", patterns: [/\b(sql|mysql|postgres|mongodb|redis|firebase|supabase|prisma|database|query|orm)\b/i] },
  { topic: "Cybersecurity", patterns: [/\b(security|encrypt|auth|oauth|jwt|xss|csrf|vulnerability|pentest|firewall)\b/i] },
  { topic: "Design & UI/UX", patterns: [/\b(design|figma|ui.ux|wireframe|prototype|user\s*experience|color\s*scheme|typography|layout)\b/i] },
  { topic: "Career & Jobs", patterns: [/\b(career|resume|interview|job|hire|salary|promotion|skill|portfolio|linkedin)\b/i] },
  { topic: "Business & Strategy", patterns: [/\b(business|startup|entrepreneur|marketing|revenue|product|strategy|growth|monetiz|saas)\b/i] },
  { topic: "Writing & Content", patterns: [/\b(write|blog|article|essay|copy|content|email|newsletter|documentation)\b/i] },
  { topic: "Mathematics", patterns: [/\b(math|calculus|algebra|geometry|statistics|equation|proof|theorem|matrix|vector)\b/i] },
  { topic: "Science", patterns: [/\b(physics|chemistry|biology|science|research|experiment|hypothesis|theory|quantum)\b/i] },
  { topic: "Education & Learning", patterns: [/\b(learn|study|course|tutorial|education|student|teacher|curriculum|exam|certificate)\b/i] },
  { topic: "Industrial Automation", patterns: [/\b(plc|scada|hmi|automation|industrial|manufacturing|robot|sensor|actuator|ladder\s*logic)\b/i] },
  { topic: "Gaming", patterns: [/\b(game|gaming|unity|unreal|godot|pixel|sprite|shader|level\s*design)\b/i] },
  { topic: "Health & Fitness", patterns: [/\b(health|fitness|exercise|diet|nutrition|workout|mental\s*health|sleep|meditation|wellness)\b/i] },
];

/* ── Knowledge indicators — signals the user knows a topic well ── */
const KNOWLEDGE_SIGNALS = [
  /i('ve| have)\s+(built|created|developed|written|implemented|deployed|designed|published)/i,
  /my\s+(project|app|website|code|system|framework|library|api|product)/i,
  /i\s+(work|worked)\s+(on|with|at|in)\b/i,
  /i('m| am)\s+a\s+(developer|engineer|designer|scientist|analyst|researcher|student|teacher|professional)/i,
  /i\s+(know|understand|specialize|expert|experienced)\b/i,
  /in\s+my\s+(experience|opinion|work|field)/i,
];

/* ── Style detection — how does the user prefer responses ── */
function detectStyle(messages: string[]): "concise" | "detailed" | "technical" | "casual" {
  const allText = messages.join(" ").toLowerCase();
  const wordCount = allText.split(/\s+/).length;
  const avgMessageLength = wordCount / Math.max(messages.length, 1);

  // Short messages → user prefers concise
  if (avgMessageLength < 15) return "concise";

  // Technical vocabulary
  const techWords = (allText.match(/\b(implement|architecture|algorithm|optimize|refactor|deploy|configure|integrate|abstract|interface|protocol)\b/gi) || []).length;
  if (techWords > 3) return "technical";

  // Casual language
  const casualWords = (allText.match(/\b(hey|cool|awesome|lol|haha|thanks|thx|btw|idk|gonna|wanna|gotta)\b/gi) || []).length;
  if (casualWords > 2) return "casual";

  return "detailed";
}

/* ── Core API ── */

export function loadProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { ...DEFAULT_PROFILE };
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch { /* storage full */ }
}

/**
 * Analyze a user message and update the profile.
 * Call this after each user message.
 */
export function learnFromMessage(message: string, profile: UserProfile): UserProfile {
  const updated = { ...profile };
  updated.messageCount += 1;
  updated.lastUpdated = Date.now();

  // Extract topics
  for (const { topic, patterns } of TOPIC_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        const existing = updated.interests.find((i) => i.topic === topic);
        if (existing) {
          existing.count += 1;
          existing.lastSeen = Date.now();
        } else {
          updated.interests.push({ topic, count: 1, lastSeen: Date.now() });
        }
        break; // Only count each topic once per message
      }
    }
  }

  // Detect knowledge areas
  for (const signal of KNOWLEDGE_SIGNALS) {
    if (signal.test(message)) {
      // Find which topic the knowledge applies to
      for (const { topic, patterns } of TOPIC_PATTERNS) {
        for (const pattern of patterns) {
          if (pattern.test(message) && !updated.knowledgeAreas.includes(topic)) {
            updated.knowledgeAreas.push(topic);
          }
        }
      }
      break;
    }
  }

  // Keep only top 15 interests, sorted by count
  updated.interests.sort((a, b) => b.count - a.count);
  if (updated.interests.length > 15) {
    updated.interests = updated.interests.slice(0, 15);
  }

  // Keep only top 8 knowledge areas
  if (updated.knowledgeAreas.length > 8) {
    updated.knowledgeAreas = updated.knowledgeAreas.slice(0, 8);
  }

  return updated;
}

/**
 * Batch-learn from multiple messages (e.g., at end of conversation).
 */
export function learnFromConversation(userMessages: string[]): UserProfile {
  let profile = loadProfile();

  for (const msg of userMessages) {
    profile = learnFromMessage(msg, profile);
  }

  // Update style preference
  if (userMessages.length >= 3) {
    profile.preferredStyle = detectStyle(userMessages);
  }

  saveProfile(profile);
  return profile;
}

/**
 * Build a personalization context string for the AI system prompt.
 * Returns empty string if profile is too sparse.
 */
export function buildPersonalizationContext(profile: UserProfile): string {
  if (profile.messageCount < 3 || profile.interests.length === 0) return "";

  const parts: string[] = [];

  // Top interests
  const topInterests = profile.interests.slice(0, 5).map((i) => i.topic);
  if (topInterests.length > 0) {
    parts.push(`The user is interested in: ${topInterests.join(", ")}.`);
  }

  // Knowledge areas
  if (profile.knowledgeAreas.length > 0) {
    parts.push(`The user has experience with: ${profile.knowledgeAreas.join(", ")}. You can assume familiarity with these topics and skip basic explanations.`);
  }

  // Response style
  const styleGuide: Record<string, string> = {
    concise: "The user prefers short, to-the-point answers. Be concise.",
    detailed: "The user appreciates thorough explanations with examples.",
    technical: "The user prefers technical depth. Use precise terminology and include implementation details.",
    casual: "The user prefers a friendly, casual tone. Keep things relaxed.",
  };
  parts.push(styleGuide[profile.preferredStyle]);

  return parts.join(" ");
}

/**
 * Quick summary of user profile for display purposes.
 */
export function getProfileSummary(profile: UserProfile): { topInterests: string[]; knowledgeAreas: string[]; style: string; messageCount: number } {
  return {
    topInterests: profile.interests.slice(0, 5).map((i) => i.topic),
    knowledgeAreas: profile.knowledgeAreas,
    style: profile.preferredStyle,
    messageCount: profile.messageCount,
  };
}
