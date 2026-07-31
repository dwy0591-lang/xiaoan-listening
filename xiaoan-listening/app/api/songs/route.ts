import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { songs } from "../../../db/schema";
import { hasSupabase, supabaseRequest } from "../../../db/supabase";

const platformHosts: Record<string, string[]> = {
  "QQ音乐": ["y.qq.com", "qq.com"],
  "网易云音乐": ["music.163.com", "163cn.tv"],
  "Apple Music": ["music.apple.com"],
};

function safeMusicUrl(value: string, platform: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const allowed = platformHosts[platform] || [];
    if (!allowed.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    if (hasSupabase()) {
      const rows = await supabaseRequest<
        { id: number; title: string; artist: string; platform: string; url: string; note: string; created_at: string }[]
      >("songs?select=id,title,artist,platform,url,note,created_at&order=id.desc&limit=40");
      return Response.json({
        songs: rows.map((song) => ({ ...song, createdAt: song.created_at })),
      });
    }
    const db = await getDb();
    const list = await db.select().from(songs).orderBy(desc(songs.id)).limit(40);
    return Response.json({ songs: list });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "歌单暂时漂远了" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      title?: string;
      artist?: string;
      platform?: string;
      url?: string;
      note?: string;
    };
    const title = payload.title?.trim() || "";
    const artist = payload.artist?.trim() || "";
    const platform = payload.platform?.trim() || "";
    const note = payload.note?.trim() || "";
    const url = safeMusicUrl(payload.url?.trim() || "", platform);

    if (title.length < 1 || title.length > 80) {
      return Response.json({ error: "写下歌名就可以啦" }, { status: 400 });
    }
    if (!url) {
      return Response.json({ error: "请粘贴所选音乐平台的 HTTPS 分享链接" }, { status: 400 });
    }
    if (note.length < 2 || note.length > 120) {
      return Response.json({ error: "推荐语请写 2—120 个字" }, { status: 400 });
    }

    if (hasSupabase()) {
      const [song] = await supabaseRequest<
        { id: number; title: string; artist: string; platform: string; url: string; note: string; created_at: string }[]
      >("songs", {
        method: "POST",
        body: JSON.stringify({ title, artist, platform, url, note }),
      });
      return Response.json({ song: { ...song, createdAt: song.created_at } }, { status: 201 });
    }

    const db = await getDb();
    const [song] = await db
      .insert(songs)
      .values({ title, artist, platform, url, note })
      .returning();
    return Response.json({ song }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "这首歌还没分享成功" },
      { status: 500 },
    );
  }
}
