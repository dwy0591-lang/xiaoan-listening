import { sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { glows } from "../../../db/schema";
import { hasSupabase, supabaseRequest } from "../../../db/supabase";

const seedGlows = [
  "我很会认真听别人说话，也开始学着听见自己。",
  "今天按时吃了饭，这件小事也值得夸夸。",
  "我拥有很细腻的感受力，能看见生活里微小的美。",
  "我没有因为害怕就彻底停下，我其实很勇敢。",
  "我的温柔不是软弱，是我选择对世界保留善意。",
  "我正在慢慢成为自己喜欢的大人。",
];

export async function GET() {
  try {
    if (hasSupabase()) {
      type SupabaseGlow = { id: number; content: string; created_at: string };
      let rows = await supabaseRequest<SupabaseGlow[]>(
        "glows?select=id,content,created_at&limit=200",
      );
      if (rows.length === 0) {
        await supabaseRequest("glows", {
          method: "POST",
          body: JSON.stringify(seedGlows.map((content) => ({ content }))),
        });
        rows = await supabaseRequest<SupabaseGlow[]>(
          "glows?select=id,content,created_at&limit=200",
        );
      }
      const glow = rows[Math.floor(Math.random() * rows.length)];
      return Response.json({
        glow: {
          id: glow.id,
          content: glow.content,
          createdAt: glow.created_at,
        },
      });
    }

    const db = await getDb();
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(glows);
    if (Number(count) === 0) {
      await db.insert(glows).values(seedGlows.map((content) => ({ content })));
    }
    const [glow] = await db
      .select()
      .from(glows)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return Response.json({ glow });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "微光暂时藏起来了" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { content?: string };
    const content = payload.content?.trim() ?? "";
    if (content.length < 2 || content.length > 160) {
      return Response.json({ error: "请写下 2—160 个字的肯定" }, { status: 400 });
    }
    if (hasSupabase()) {
      const [glow] = await supabaseRequest<
        { id: number; content: string; created_at: string }[]
      >("glows", {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      return Response.json({ glow }, { status: 201 });
    }

    const db = await getDb();
    const [glow] = await db.insert(glows).values({ content }).returning();
    return Response.json({ glow }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "还没能收好这束微光" },
      { status: 500 },
    );
  }
}
