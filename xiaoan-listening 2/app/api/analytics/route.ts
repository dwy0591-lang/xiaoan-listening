import { sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { pageViews } from "../../../db/schema";
import { hasSupabase, supabaseRequest } from "../../../db/supabase";

const allowedPaths = new Set(["/", "/write", "/plaza", "/joy", "/glow", "/music", "/me"]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { path?: string };
    const path = payload.path?.split("?")[0] || "/";
    if (!allowedPaths.has(path)) return Response.json({ ok: true });
    if (hasSupabase()) {
      await supabaseRequest("page_views", {
        method: "POST",
        body: JSON.stringify({ path }),
      });
      return Response.json({ ok: true }, { status: 201 });
    }
    const db = await getDb();
    await db.insert(pageViews).values({ path });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ ok: false }, { status: 202 });
  }
}

export async function GET() {
  try {
    if (hasSupabase()) {
      const rows = await supabaseRequest<{ path: string; created_at: string }[]>(
        "page_views?select=path,created_at&order=created_at.asc&limit=10000",
      );
      const now = new Date();
      const todayKey = now.toISOString().slice(0, 10);
      const weekStart = new Date(now);
      weekStart.setUTCDate(weekStart.getUTCDate() - 6);
      weekStart.setUTCHours(0, 0, 0, 0);
      const dailyMap = new Map<string, number>();
      const pathMap = new Map<string, number>();
      let today = 0;
      let week = 0;
      for (const row of rows) {
        const date = new Date(row.created_at);
        const day = date.toISOString().slice(0, 10);
        if (day === todayKey) today += 1;
        if (date >= weekStart) week += 1;
        dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
        pathMap.set(row.path, (pathMap.get(row.path) || 0) + 1);
      }
      return Response.json({
        summary: { total: rows.length, today, week },
        daily: [...dailyMap.entries()].slice(-14).map(([date, views]) => ({ date, views })),
        paths: [...pathMap.entries()]
          .map(([path, views]) => ({ path, views }))
          .sort((a, b) => b.views - a.views),
        privacy: "只统计每个页面的访问次数，不记录姓名、IP、心事内容或设备身份。",
      });
    }
    const db = await getDb();
    const [summary] = await db
      .select({
        total: sql<number>`count(*)`,
        today: sql<number>`sum(case when date(${pageViews.createdAt}) = date('now') then 1 else 0 end)`,
        week: sql<number>`sum(case when ${pageViews.createdAt} >= datetime('now', '-6 days') then 1 else 0 end)`,
      })
      .from(pageViews);
    const daily = await db
      .select({
        date: sql<string>`date(${pageViews.createdAt})`,
        views: sql<number>`count(*)`,
      })
      .from(pageViews)
      .where(sql`${pageViews.createdAt} >= datetime('now', '-13 days')`)
      .groupBy(sql`date(${pageViews.createdAt})`)
      .orderBy(sql`date(${pageViews.createdAt})`);
    const paths = await db
      .select({ path: pageViews.path, views: sql<number>`count(*)` })
      .from(pageViews)
      .groupBy(pageViews.path)
      .orderBy(sql`count(*) desc`);
    return Response.json({
      summary: {
        total: Number(summary?.total || 0),
        today: Number(summary?.today || 0),
        week: Number(summary?.week || 0),
      },
      daily: daily.map((item) => ({ ...item, views: Number(item.views) })),
      paths: paths.map((item) => ({ ...item, views: Number(item.views) })),
      privacy: "只统计每个页面的访问次数，不记录姓名、IP、心事内容或设备身份。",
    });
  } catch {
    return Response.json({ error: "访问数据还在准备中" }, { status: 503 });
  }
}
