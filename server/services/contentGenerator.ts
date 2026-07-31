import { v4 as uuidv4 } from 'uuid';
import type { Product } from '../db.js';
import { addContent, logActivity } from '../db.js';

const HOOKS = [
  'POV: You just found the product that changed everything',
  'Stop scrolling — this is making people $1000+/month',
  'I wish I knew about this sooner 😭',
  'This is the side hustle nobody talks about',
  'Watch me turn ${profit} profit on ONE sale',
  'The algorithm wants you to see this',
  'Why is nobody talking about this??',
  'I tested this for 30 days — here are the results',
];

const TOOL_HOOKS = [
  'This tool literally runs your business while you sleep',
  'POV: You finally found the tool that prints money',
  'Stop doing this manually — use this instead',
  'I made $${profit} this week with ONE tool',
  'Why is nobody talking about this tool??',
  'This SGOS tool changed my entire side hustle',
];

const CAPTION_TEMPLATES: Record<string, (p: Product, profit: number) => string> = {
  tiktok: (p, profit) => {
    if (p.productType === 'tool') {
      return `🛠️ ${p.name} — $${p.sellPrice.toFixed(0)}/tool\n\n${p.description || 'The tool side hustlers are using to automate income.'}\n\n` +
        `${(p.stock ?? 0) > 0 ? `${p.stock} left in stock — grab yours 👆` : 'Get yours now 👆'}\n\n#sgos #sidehustle #tools`;
    }
    return `${p.name} is literally printing money right now 💰\n\n` +
      `Cost: $${p.cost.toFixed(2)} → Sell: $${p.sellPrice.toFixed(2)}\n` +
      `Profit per sale: $${profit.toFixed(2)} 🔥\n\n` +
      `Link in bio 👆 #sidehustle #makemoneyonline`;
  },
  instagram: (p, profit) => {
    if (p.productType === 'tool') {
      return `✨ SGOS Tool: ${p.name} ✨\n\n${p.description || ''}\n\n` +
        `💰 Price: $${p.sellPrice.toFixed(2)} per tool\n📦 ${p.unitsSold ?? 0} sold · ${p.stock ?? 0} in stock\n\n` +
        `Comment "TOOL" for the link!`;
    }
    const marginPct = p.cost > 0 ? Math.round((profit / p.cost) * 100) : 100;
    return `✨ ${p.name} ✨\n\nThis product has a ${marginPct}% profit margin!\n\n` +
      `💵 Buy: $${p.cost.toFixed(2)}\n💰 Sell: $${p.sellPrice.toFixed(2)}\n📈 Profit: $${profit.toFixed(2)}/sale\n\n` +
      `Drop a 🔥 if you want the supplier link!`;
  },
  twitter: (p, profit) => {
    if (p.productType === 'tool') {
      return `New SGOS tool drop 🛠️\n\n${p.name} — $${p.sellPrice.toFixed(0)}/tool\n${p.description || ''}\n\n${p.unitsSold ?? 0} sold so far. Link in bio.`;
    }
    return `Just found a product doing $${profit.toFixed(0)} profit per sale:\n\n` +
      `${p.name}\nCost: $${p.cost.toFixed(2)} | Sell: $${p.sellPrice.toFixed(2)}\n\n` +
      `This is the kind of margin that builds real income. 🧵`;
  },
  facebook: (p, profit) =>
    `🚀 Product Alert: ${p.name}\n\n` +
    `I've been researching profitable products and this one stands out:\n\n` +
    `• Your cost: $${p.cost.toFixed(2)}\n` +
    `• Sell price: $${p.sellPrice.toFixed(2)}\n` +
    `• Profit per sale: $${profit.toFixed(2)}\n\n` +
    `Comment "LINK" and I'll send you the details!`,
};

const HASHTAG_SETS: Record<string, string[]> = {
  tiktok: ['#fyp', '#viral', '#sidehustle', '#makemoneyonline', '#entrepreneur', '#dropshipping', '#moneytok'],
  instagram: ['#sidehustle', '#entrepreneurlife', '#makemoney', '#onlinebusiness', '#financialfreedom', '#passiveincome'],
  twitter: ['#sidehustle', '#entrepreneur', '#makemoney'],
  facebook: ['#sidehustle', '#makemoney', '#entrepreneur'],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function calculateContentViralScore(product: Product, platform: string): number {
  const profit = product.sellPrice - product.cost;
  const marginPct = product.cost > 0 ? (profit / product.cost) * 100 : 100;
  let score = product.viralScore;

  if (marginPct > 200) score += 10;
  else if (marginPct > 100) score += 5;

  if (platform === 'tiktok') score += 3;
  if (product.source === 'discovered') score += 2;

  return Math.min(99, score);
}

export interface GeneratedPost {
  id: string;
  productId: string;
  platform: string;
  hook: string;
  caption: string;
  hashtags: string;
  viralScore: number;
}

export function generateContentForProduct(product: Product, platforms: string[]): GeneratedPost[] {
  const profit = product.sellPrice - product.cost;
  const posts: GeneratedPost[] = [];

  for (const platform of platforms) {
    const template = CAPTION_TEMPLATES[platform] || CAPTION_TEMPLATES.tiktok;
    const hooks = product.productType === 'tool' ? TOOL_HOOKS : HOOKS;
    const hook = pickRandom(hooks).replace('${profit}', profit.toFixed(0));
    const caption = template(product, profit);
    const tags = (HASHTAG_SETS[platform] || HASHTAG_SETS.tiktok).join(' ');
    const viralScore = calculateContentViralScore(product, platform);

    posts.push({
      id: uuidv4(),
      productId: product.id,
      platform,
      hook,
      caption,
      hashtags: tags,
      viralScore,
    });
  }

  return posts;
}

export function generateAndSaveContent(product: Product, platforms: string[]) {
  const posts = generateContentForProduct(product, platforms);
  const saved = posts.map(p => {
    const content = addContent({
      ...p,
      status: 'queued',
    });
    logActivity('content', `📝 Generated ${p.platform} post for "${product.name}" (score: ${p.viralScore})`);
    return content;
  });
  return saved;
}

export async function generateWithAI(product: Product, platform: string): Promise<GeneratedPost | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const profit = product.sellPrice - product.cost;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Create viral ${platform} content for this product:
Product: ${product.name}
Cost: $${product.cost}, Sell: $${product.sellPrice}, Profit: $${profit}
Category: ${product.category}

Return JSON: {"hook":"...","caption":"...","hashtags":"..."}`,
        }],
        temperature: 0.9,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as { hook: string; caption: string; hashtags: string };
    return {
      id: uuidv4(),
      productId: product.id,
      platform,
      hook: parsed.hook,
      caption: parsed.caption,
      hashtags: parsed.hashtags,
      viralScore: calculateContentViralScore(product, platform) + 5,
    };
  } catch {
    return null;
  }
}
