import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { comments, posts } from "../../../db/schema";
import { hasSupabase, supabaseRequest } from "../../../db/supabase";

const samplePosts = [
  {
    mood: "被误解",
    content:
      "我常常想解释自己，又觉得语言太轻，装不下我真正的感受。后来我学着不急着证明，先站在自己这边。",
  },
  {
    mood: "自我内耗",
    content:
      "今天开会时说错了一句话，我回家路上想了很久。写到这里，忽然觉得：可能大家早就忘了，我也可以放过自己。",
  },
  {
    mood: "偶尔欣喜",
    content:
      "下班时看见云被夕阳染成淡紫色，买到了喜欢的面包。今天没有发生大事，但我偷偷喜欢今天。",
  },
];

export async function GET() {
  try {
    if (hasSupabase()) {
      type SupabasePost = {
        id: number;
        content: string;
        mood: string;
        created_at: string;
        comments: { id: number; content: string; created_at: string }[];
      };
      let rows = await supabaseRequest<SupabasePost[]>(
        "posts?select=id,content,mood,created_at,comments(id,content,created_at)&order=id.desc&limit=30",
      );
      if (rows.length === 0) {
        await supabaseRequest("posts", {
          method: "POST",
          body: JSON.stringify(samplePosts),
        });
        rows = await supabaseRequest<SupabasePost[]>(
          "posts?select=id,content,mood,created_at,comments(id,content,created_at)&order=id.desc&limit=30",
        );
      }
      return Response.json({
        posts: rows.map((post) => ({
          id: post.id,
          content: post.content,
          mood: post.mood,
          createdAt: post.created_at,
          comments: (post.comments || []).map((comment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.created_at,
          })),
        })),
      });
    }

    const db = await getDb();
    let rows = await db.select().from(posts).orderBy(desc(posts.id)).limit(30);

    if (rows.length === 0) {
      await db.insert(posts).values(samplePosts);
      rows = await db.select().from(posts).orderBy(desc(posts.id)).limit(30);
    }

    const result = await Promise.all(
      rows.map(async (post) => ({
        ...post,
        comments: await db
          .select()
          .from(comments)
          .where(eq(comments.postId, post.id))
          .orderBy(asc(comments.id))
          .limit(12),
      })),
    );

    return Response.json({ posts: result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "暂时无法打开树洞" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { content?: string; mood?: string };
    const content = payload.content?.trim() ?? "";
    const mood = payload.mood?.trim() || "此刻心情";

    if (content.length < 3 || content.length > 1500) {
      return Response.json({ error: "请写下 3—1500 个字的心事" }, { status: 400 });
    }

    if (hasSupabase()) {
      const [post] = await supabaseRequest<
        { id: number; content: string; mood: string; created_at: string }[]
      >("posts", {
        method: "POST",
        body: JSON.stringify({ content, mood }),
      });
      return Response.json({ post }, { status: 201 });
    }

    const db = await getDb();
    const [post] = await db.insert(posts).values({ content, mood }).returning();
    return Response.json({ post }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "投递没有成功" },
      { status: 500 },
    );
  }
}
