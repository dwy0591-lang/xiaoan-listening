const moodOpenings: Record<string, string[]> = {
  自我内耗: [
    "嗯，我听懂了。你已经在心里把它来回想了好多遍，对吧。",
    "先别急着怪自己，我把你这一句接住了。",
  ],
  委屈迷茫: [
    "这确实挺委屈的，不是一句“别想啦”就能翻篇。",
    "你一边难过，一边还在想到底哪里出了问题，怪累的。",
  ],
  生气: [
    "生气不是不温柔，是心里有一块地方真的被碰疼了。",
    "嗯，这次先不劝你大度。该生气的时候，小岸陪你气一会儿。",
  ],
  后悔: [
    "你已经在脑子里倒带好多遍了吧，先别继续罚自己啦。",
    "会后悔，说明你很在意。可那时候的你，也只有当时知道的那么多。",
  ],
  焦虑不安: [
    "事情还没发生，心已经跑出去很远了。来，先和小岸一起回来。",
    "你不是想太多，你只是太想把事情做好了。咱们先只管眼前这一小步。",
  ],
  有点孤独: [
    "一个人待着和觉得孤单，是两回事。你现在想有人陪一下，我就在。",
    "今晚的海边有点空，那我挪近一点，咱们先不说话也行。",
  ],
  被误解: [
    "明明认真说了，却没被听懂，心里会一下子空掉吧。",
    "我知道，你真正想说的，比别人第一眼看到的多得多。",
  ],
  偶尔欣喜: [
    "哎呀，这点开心被你捡到啦。快放好，别让海风吹走。",
    "读到这里，我的水豚嘴角也偷偷翘起来了。",
  ],
  渴望被看见: [
    "想被看见一点都不过分呀，谁不想被认真回应呢。",
    "你会在意，是因为你真的把自己的一小块放进去了。",
  ],
};

type TopicReply = {
  heard: string;
  detail: (content: string) => string;
};

const topicReplies: Array<{ match: RegExp; value: TopicReply }> = [
  {
    match: /网页|网站|页面|设计|作品|创作|画画|插画|摄影|写作|视频|剪辑|文案|方案|发布|灵感|审美/,
    value: {
      heard: "创作，以及作品能不能被喜欢",
      detail: (content) => {
        if (/会不会.*喜欢|有人.*喜欢|没人.*喜欢|能不能.*喜欢|受欢迎/.test(content)) {
          return "你是在担心：花心思做出来的网页，会不会根本没人喜欢。我懂，这挺像把自己的一小块递给别人看，当然会紧张。先别替所有人提前下结论呀，让它先遇见第一批人。有人喜欢就记下来，哪里卡住就慢慢改。作品不用讨好每一个人，能让同频的人停下来，就已经很棒了。";
        }
        return "做东西做到一半开始怀疑自己，太正常了。你能看出哪里不满意，反而说明你已经有自己的审美啦。先把这一版做完，让真正看过的人来告诉你感受，别一个人在发布前把所有坏结果都猜一遍。";
      },
    },
  },
  {
    match: /工作|上班|领导|同事|实习|开会|汇报|面试|简历|方案|客户|加班/,
    value: {
      heard: "工作里的压力与自我怀疑",
      detail: () =>
        "工作里一个小失误，认真又敏感的人很容易回家再想八百遍。但一次表现真的概括不了你。要改的记一条就好，剩下那些“我是不是很差”，先丢给我保管。",
    },
  },
  {
    match: /学习|考试|成绩|论文|考研|学校|作业|答辩|复习/,
    value: {
      heard: "学习和结果带来的压力",
      detail: () =>
        "结果还没出来，你的大脑就先偷偷写了个“我不行”的结局。先别急呀，你做过的努力都是真的。现在只看下一小步，未来那部分先让它在海上飘一会儿。",
    },
  },
  {
    match: /男朋友|女朋友|男友|女友|对象|恋爱|分手|前任|暧昧|感情|被爱|爱我|关系里/,
    value: {
      heard: "一段关系带来的难过",
      detail: () =>
        "关系里一难过，人就很容易开始挑自己的毛病。可对方的反应，只能说明你们之间发生了什么，不能给你的可爱程度打分。先照顾一下自己的感受，再想下一步。",
    },
  },
  {
    match: /朋友|同学|室友|家人|爸爸|妈妈|父母|社交|合群|孤独|一个人/,
    value: {
      heard: "和身边人的相处",
      detail: () =>
        "你既怕别人难过，又不想委屈自己，所以才卡在这里。其实温柔和有边界可以同时存在。水豚也会靠近喜欢的人，但累了就会自己趴一会儿。",
    },
  },
  {
    match: /后悔|做错|搞砸|失败|丢脸|尴尬|说错/,
    value: {
      heard: "一件让你反复责怪自己的事",
      detail: () =>
        "你会一直想，是因为你真的很在意。能补救的就做一件具体的小事，做不了的先放下。别再靠骂自己来证明你有多认真啦。",
    },
  },
  {
    match: /开心|终于|幸运|期待|好喜欢|好美|治愈|完成了|成功了/,
    value: {
      heard: "一件让你心里亮起来的小事",
      detail: () =>
        "不用等到发生大事才准自己开心呀。你现在这点亮晶晶的感觉就很好，我帮你用两只爪子捧住了。",
    },
  },
  {
    match: /未来|选择|决定|会不会|怎么办|迷茫|不确定|担心|害怕|焦虑/,
    value: {
      heard: "还没有答案的不确定",
      detail: () =>
        "我猜你现在最想要的，是一个确定答案，不是别人轻飘飘说一句“别担心”。可暂时不知道，不等于一定会变坏。咱们先找一件今天能试的小事，让事实帮你说话。",
    },
  },
];

function pick(list: string[], seed: number) {
  return list[Math.abs(seed) % list.length];
}

function understand(content: string): TopicReply {
  return (
    topicReplies.find((topic) => topic.match.test(content))?.value || {
      heard: "你此刻真正放不下的事",
      detail: () =>
        "我先不急着替你下结论。你能把它写下来，就已经在照顾自己了。答案慢一点也没事，今晚不用把所有事情都想明白。",
    }
  );
}

type ArkResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

type ComfortReply = {
  heard: string;
  reply: string;
};

const recentRequests = new Map<string, number[]>();

function isRateLimited(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const visitor = forwardedFor || request.headers.get("x-real-ip") || "anonymous";
  const now = Date.now();
  const windowStart = now - 10 * 60 * 1000;
  const recent = (recentRequests.get(visitor) || []).filter((time) => time > windowStart);

  if (recent.length >= 6) return true;
  recent.push(now);
  recentRequests.set(visitor, recent);
  return false;
}

function extractArkText(data: ArkResponse) {
  if (data.output_text?.trim()) return data.output_text.trim();

  return (data.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text" || Boolean(item.text))
    .map((item) => item.text || "")
    .join("")
    .trim();
}

function parseComfortReply(text: string): ComfortReply | null {
  try {
    const jsonText = text.match(/\{[\s\S]*\}/)?.[0] || text;
    const value = JSON.parse(jsonText) as Partial<ComfortReply>;
    const heard = value.heard?.trim().slice(0, 40);
    const reply = value.reply?.trim().slice(0, 420);

    if (!heard || !reply) return null;
    return { heard, reply };
  } catch {
    return null;
  }
}

async function askArk(content: string, mood: string) {
  const apiKey = process.env.ARK_API_KEY?.trim();
  const model = process.env.ARK_MODEL?.trim();
  const baseUrl = (process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3")
    .trim()
    .replace(/\/$/, "");

  if (!apiKey || !model) return null;

  const prompt = `你是“小岸”，一只安静、真诚、稍微有点可爱的海边水豚朋友。你正在回复一位写下心事的用户。

用户选择的心情：${mood}
用户写下的内容：${content}

请严格做到：
1. 先准确理解这段话具体在说什么，绝不能套用无关的恋爱、工作或家庭话术。
2. 像熟悉的朋友聊天，先接住情绪，再回应其中最具体的担忧或细节；不要说教，不要诊断，不要使用“你要相信自己”等空话。
3. 可以自然加入一句水豚或海边视角，但不要每句都卖萌。
4. 回复控制在90至160个中文字符，温柔但不腻，不假装真人或心理咨询师。
5. 只返回JSON，不要Markdown，格式必须是：{"heard":"用10至24个字概括真正听见的事","reply":"给用户的完整回复"}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: prompt,
        max_output_tokens: 320,
        thinking: { type: "disabled" },
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Ark request failed", response.status, await response.text());
      return null;
    }

    const text = extractArkText((await response.json()) as ArkResponse);
    return parseComfortReply(text);
  } catch (error) {
    console.error("Ark request error", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function fallbackReply(content: string, mood: string) {
  const topic = understand(content);
  const openings = moodOpenings[mood] || ["嗯，我把你写的都看完啦。"];
  const opening = pick(openings, content.length + mood.length);
  const ending = pick(
    [
      "先歇五分钟，我去给你占个能看海的位置。",
      "你先站在自己这边，我坐你旁边。",
      "没想明白也没关系，水豚做决定也会发呆很久。",
    ],
    content.charCodeAt(0) + content.length,
  );

  return {
    heard: topic.heard,
    reply: `${opening}${topic.detail(content)}${ending}`,
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { content?: string; mood?: string };
    const content = payload.content?.trim().replace(/\s+/g, " ") ?? "";
    const mood = payload.mood?.trim() || "此刻心情";

    if (content.length < 3 || content.length > 1500) {
      return Response.json({ error: "请写下 3—1500 个字" }, { status: 400 });
    }

    if (/不想活|想死|自杀|结束生命|活不下去/.test(content)) {
      return Response.json({
        heard: "你现在正承受着很重的痛苦",
        reply:
          "我很在意你刚刚写下的这些话。现在先不要一个人扛着，请立刻联系一个你信任的人，让对方陪在你身边；如果你可能马上伤害自己，请直接联系当地急救或报警电话。你值得得到真实、及时的帮助。",
        urgent: true,
      });
    }

    if (isRateLimited(request)) {
      return Response.json(
        { error: "小岸今天听见你好多句话啦，先陪自己歇一会儿，十分钟后再来找我吧" },
        { status: 429 },
      );
    }

    const generated = await askArk(content, mood);
    const answer = generated || fallbackReply(content, mood);

    return Response.json({
      heard: answer.heard,
      reply: answer.reply,
      urgent: false,
    });
  } catch {
    return Response.json({ error: "小岸刚刚被海风吹走神了，请再说一次吧" }, { status: 500 });
  }
}
