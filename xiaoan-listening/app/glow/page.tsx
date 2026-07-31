"use client";

import { useState } from "react";
import { CalmBackground, CapybaraAside, InnerHeader } from "../ui";

const dailyQuotes = [
  "今天没力气闪闪发光，也可以只做一只晒太阳的水豚。",
  "你看见了别人没注意到的细节，这就是你的天赋呀。",
  "不用拿别人的进度条，催自己的小船靠岸。",
  "能把一件小事做完，就值得我给你鼓掌三下。",
  "你不是太敏感，你只是接收到了更多颜色。",
  "温柔不是软弱，是你很珍贵的一部分。",
  "今天也站在自己这边吧，我站你旁边。",
];

export default function GlowPage() {
  const [content, setContent] = useState("");
  const [drawn, setDrawn] = useState("");
  const [notice, setNotice] = useState("");
  const [drawing, setDrawing] = useState(false);

  const [dailyQuote] = useState(
    () => dailyQuotes[new Date().getDay() % dailyQuotes.length],
  );

  const deposit = async () => {
    const trimmed = content.trim();
    const response = await fetch("/api/glow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: trimmed }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setNotice(data.error || "还没有收好，再试一次吧");
      return;
    }
    const saved = JSON.parse(
      localStorage.getItem("little-shore-glows") || "[]",
    ) as { content: string; createdAt: string }[];
    saved.unshift({ content: trimmed, createdAt: new Date().toISOString() });
    localStorage.setItem("little-shore-glows", JSON.stringify(saved.slice(0, 80)));
    setContent("");
    setNotice("收好啦。小岸把它擦得亮亮的，等同频的人捡到。");
  };

  const draw = async () => {
    setDrawing(true);
    setNotice("");
    try {
      const response = await fetch("/api/glow");
      const data = (await response.json()) as {
        glow?: { content: string };
        error?: string;
      };
      if (!response.ok || !data.glow) throw new Error(data.error || "暂时没有抽到");
      setDrawn(data.glow.content);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "微光暂时藏起来了");
    } finally {
      setDrawing(false);
    }
  };

  return (
    <main className="inner-page glow-page">
      <CalmBackground />
      <InnerHeader />
      <section className="wide-wrap">
        <div className="section-intro centered">
          <span className="section-number">03</span>
          <p className="eyebrow">小岸今天也捡到了漂亮贝壳</p>
          <h1>你身上的闪光，也值得被好好收着</h1>
          <p>别不好意思夸自己，我先给你打个样：你真的很会发现美。</p>
        </div>
        <CapybaraAside>今天也捡一枚自己的优点吧，小小的也算数。</CapybaraAside>

        <div className="daily-quote">
          <span>小岸今天想对你说</span>
          <p>“{dailyQuote}”</p>
          <small>明天再来，我还会换一句悄悄话</small>
        </div>

        <div className="glow-grid">
          <section className="glow-panel deposit-panel">
            <span className="panel-icon">✎</span>
            <p className="eyebrow">Deposit a light</p>
            <h2>存入一束微光</h2>
            <p>写下一件做成的小事、一个优点，或值得被喜欢的地方。</p>
            <textarea
              value={content}
              maxLength={160}
              onChange={(event) => setContent(event.target.value)}
              placeholder="比如：我很会照顾别人的感受，也正在学着照顾自己。"
            />
            <button className="panel-button" type="button" onClick={() => void deposit()}>
              收进闪光贝壳
            </button>
          </section>

          <section className="glow-panel draw-panel">
            <span className="panel-icon">✦</span>
            <p className="eyebrow">Receive a light</p>
            <h2>抽取陌生人的微光</h2>
            <div className={`drawn-note ${drawn ? "has-text" : ""}`}>
              <span>来自一位陌生 ISFP</span>
              <p>{drawn || "有一束温柔的自我肯定，正在这里等你。"} </p>
            </div>
            <button
              className="panel-button light"
              type="button"
              disabled={drawing}
              onClick={() => void draw()}
            >
              {drawing ? "正在拾起…" : "随机抽取一束光"}
            </button>
          </section>
        </div>
        {notice && <p className="glow-notice">{notice}</p>}
      </section>
    </main>
  );
}
