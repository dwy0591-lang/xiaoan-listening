"use client";

import { useEffect, useState } from "react";
import { CalmBackground, InnerHeader } from "../ui";

type AnalyticsData = {
  summary: { total: number; today: number; week: number };
  daily: { date: string; views: number }[];
  paths: { path: string; views: number }[];
  privacy: string;
};

const pathNames: Record<string, string> = {
  "/": "首页",
  "/write": "说给小岸",
  "/plaza": "同频海滩",
  "/joy": "开心一下",
  "/glow": "闪光贝壳",
  "/music": "同频歌单",
};

export default function InsightsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/analytics")
      .then(async (response) => {
        const payload = (await response.json()) as AnalyticsData & { error?: string };
        if (!response.ok) throw new Error(payload.error || "暂时读不到数据");
        return payload;
      })
      .then(setData)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "暂时读不到数据"));
  }, []);

  const maxDaily = Math.max(1, ...(data?.daily.map((item) => item.views) || [1]));
  const maxPath = Math.max(1, ...(data?.paths.map((item) => item.views) || [1]));

  return (
    <main className="inner-page insights-page">
      <CalmBackground />
      <InnerHeader />
      <section className="insights-wrap">
        <div className="section-intro centered">
          <p className="eyebrow">小岸的来访记录</p>
          <h1>最近有多少人来海边坐过</h1>
          <p>这里只数脚印，不认识来的人，也不会偷看任何心事。</p>
        </div>

        {error && <div className="insights-empty">{error}</div>}
        {!data && !error && <div className="insights-empty">小岸正在数沙滩上的脚印…</div>}
        {data && (
          <>
            <div className="metric-grid">
              <article><span>今天</span><strong>{data.summary.today}</strong><small>次来访</small></article>
              <article><span>最近 7 天</span><strong>{data.summary.week}</strong><small>次来访</small></article>
              <article><span>上线以来</span><strong>{data.summary.total}</strong><small>次来访</small></article>
            </div>

            <div className="insights-grid">
              <section className="insight-card">
                <h2>最近 14 天</h2>
                <div className="daily-bars">
                  {data.daily.length ? data.daily.map((item) => (
                    <div key={item.date}>
                      <span><i style={{ height: `${Math.max(8, (item.views / maxDaily) * 150)}px` }} /></span>
                      <strong>{item.views}</strong>
                      <small>{item.date.slice(5).replace("-", "/")}</small>
                    </div>
                  )) : <p>还没有新的访问记录。</p>}
                </div>
              </section>

              <section className="insight-card">
                <h2>大家去了哪里</h2>
                <div className="path-bars">
                  {data.paths.map((item) => (
                    <div key={item.path}>
                      <span><strong>{pathNames[item.path] || item.path}</strong><small>{item.views} 次</small></span>
                      <i><b style={{ width: `${Math.max(5, (item.views / maxPath) * 100)}%` }} /></i>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <p className="insights-privacy">{data.privacy}</p>
          </>
        )}
      </section>
    </main>
  );
}
