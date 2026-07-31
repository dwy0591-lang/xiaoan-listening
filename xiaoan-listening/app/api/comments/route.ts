import { getDb } from "../../../db";
import { comments } from "../../../db/schema";
import { hasSupabase, supabaseRequest } from "../../../db/supabase";

const harshPatterns = [
  "你应该",
  "早就该",
  "这有什么",
  "矫情",
  "想太多",
  "活该",
  "玻璃心",
  "别装",
  "无病呻吟",
  "闭嘴",
  "蠢",
  "废物",
];

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      postId?: number;
      content?: string;
    };
    const postId = Number(payload.postId);
    const content = payload.content?.trim() ?? "";

    if (!Number.isInteger(postId) || !content || content.length > 180) {
      return Response.json({ error: "请留下 1—180 个字的温柔回应" }, { status: 400 });
    }

    if (harshPatterns.some((pattern) => content.includes(pattern))) {
      return Response.json(
        { error: "这句话可能会让对方有压力，换一种更温柔的表达吧" },
        { status: 422 },
      );
    }

    if (hasSupabase()) {
      const [comment] = await supabaseRequest<
        { id: number; post_id: number; content: string; created_at: string }[]
      >("comments", {
        method: "POST",
        body: JSON.stringify({ post_id: postId, content }),
      });
      return Response.json(
        {
          comment: {
            id: comment.id,
            postId: comment.post_id,
            content: comment.content,
            createdAt: comment.created_at,
          },
        },
        { status: 201 },
      );
    }

    const db = await getDb();
    const [comment] = await db
      .insert(comments)
      .values({ postId, content })
      .returning();
    return Response.json({ comment }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "留言没有送达" },
      { status: 500 },
    );
  }
}
