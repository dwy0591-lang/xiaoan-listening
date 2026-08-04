"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalmBackground, CapybaraAside, InnerHeader } from "../ui";

type Thought = { id?: string; content: string; mood: string; createdAt: string };
type Joy = { id: string; icon?: string; title: string; completedAt: string; reward?: string };
type Glow = { id?: string; content: string; createdAt: string };
type Letter = { id: string; content: string; mood: string; reply: string; createdAt: string };
type TimelineItem = { kind: "心事" | "开心小事" | "闪光" | "小岸回信"; title: string; text: string; time: string };

function readList<T>(key: string): T[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function MyShorePage() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [joys, setJoys] = useState<Joy[]>([]);
  const [glows, setGlows] = useState<Glow[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setThoughts(readList<Thought>("weiguang-private-thoughts"));
    setJoys(readList<Joy>("little-shore-joy-records"));
    setGlows(readList<Glow>("little-shore-glows"));
    setLetters(readList<Letter>("little-shore-letters"));
  }, []);

  const timeline = useMemo<TimelineItem[]>(() => [
    ...thoughts.map((item) => ({ kind: "心事" as const, title: item.mood, text: item.content, time: item.createdAt })),
    ...joys.map((item) => ({ kind: "开心小事" as const, title: item.title, text: item.reward || "今天照顾了自己一次。", time: item.completedAt })),
    ...glows.map((item) => ({ kind: "闪光" as const, title: "我值得被喜欢的地方", text: item.content, time: item.createdAt })),
    ...letters.map((item) => ({ kind: "小岸回信" as const, title: item.mood, text: item.reply, time: item.createdAt })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()), [thoughts, joys, glows, letters]);

  const exportAll = () => {
    const lines = [
      "小岸替我收好的海岸记录",
      `导出时间：${new Date().toLocaleString("zh-CN")}`,
      "",
      ...timeline.map((item) => `[${formatTime(item.time)} · ${item.kind} · ${item.title}]\n${item.text}`),
      timeline.length ? "" : "现在还没有记录。",
      "这些内容来自“小岸在听呢”，文件只下载到你的设备。",
    ];
    const file = new Blob([lines.join("\n\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `我的海岸记录-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("装好啦，已经放进你的下载文件里。");
    window.setTimeout(() => setNotice(""), 2500);
  };

  return (
    <main className="inner-page my-shore-page">
      <CalmBackground />
      <InnerHeader />
      <section className="my-shore-wrap">
        <div className="my-shore-hero">
          <div>
            <p className="handwritten-kicker">这是只属于你的那一小段海岸</p>
            <h1>小岸替你收好的，都在这里</h1>
            <p>心事、回信、开心小事和你写给自己的肯定，只保存在现在这台设备上。</p>
          </div>
          <CapybaraAside>偶尔回头看一眼，你已经接住自己好多次啦。</CapybaraAside>
        </div>

        <div className="my-shore-summary">
          <article><strong>{thoughts.length}</strong><span>封私密心事</span></article>
          <article><strong>{letters.length}</strong><span>封小岸回信</span></article>
          <article><strong>{joys.length}</strong><span>件开心小事</span></article>
          <article><strong>{glows.length}</strong><span>枚闪光贝壳</span></article>
        </div>

        <div className="my-shore-tools">
          <Link href="/glow"><span>✦</span><strong>去闪光贝壳</strong><small>写下优点，也抽一条同频的人留下的自我肯定。</small></Link>
          <button type="button" onClick={exportAll}><span>↓</span><strong>导出我的记录</strong><small>生成一个只下载到本机的文字文件。</small></button>
        </div>
        {notice && <p className="export-notice">{notice}</p>}

        <section className="shore-timeline">
          <div className="shore-timeline-head"><div><p className="eyebrow">慢慢积起来的证据</p><h2>最近的小小记录</h2></div></div>
          {timeline.length ? (
            <div className="shore-timeline-list">
              {timeline.slice(0, 12).map((item, index) => (
                <article key={`${item.kind}-${item.time}-${index}`}>
                  <span>{item.kind}</span>
                  <div><strong>{item.title}</strong><p>{item.text}</p><small>{formatTime(item.time)}</small></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="shore-empty"><p>海岸上还是一张干净的信纸。</p><Link href="/write">先去说一件刚刚发生的事</Link></div>
          )}
        </section>
        <p className="shore-privacy">换浏览器、清理缓存或更换设备后，本地记录可能消失。重要内容请及时导出保存。</p>
      </section>
    </main>
  );
}
