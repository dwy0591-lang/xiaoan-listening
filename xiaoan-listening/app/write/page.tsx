"use client";

import { useState } from "react";
import { CalmBackground, InnerHeader } from "../ui";

const moods = [
  "自我内耗",
  "委屈迷茫",
  "生气",
  "后悔",
  "焦虑不安",
  "有点孤独",
  "被误解",
  "偶尔欣喜",
  "渴望被看见",
];
const moodIcons: Record<string, string> = {
  自我内耗: "☁",
  委屈迷茫: "〰",
  生气: "♨",
  后悔: "↶",
  焦虑不安: "≈",
  有点孤独: "☾",
  被误解: "◌",
  偶尔欣喜: "☀",
  渴望被看见: "✦",
};

type SavedThought = {
  id: string;
  content: string;
  mood: string;
  createdAt: string;
};

export default function WritePage() {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(moods[0]);
  const [mode, setMode] = useState<"private" | "public">("private");
  const [message, setMessage] = useState("");
  const [botReply, setBotReply] = useState("");
  const [heard, setHeard] = useState("");
  const [urgentReply, setUrgentReply] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = content.trim();
    if (trimmed.length < 3) {
      setMessage("再多写一点点吧，小岸在认真听。");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      if (mode === "private") {
        const saved = JSON.parse(
          localStorage.getItem("weiguang-private-thoughts") || "[]",
        ) as SavedThought[];
        saved.unshift({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          content: trimmed,
          mood,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(
          "weiguang-private-thoughts",
          JSON.stringify(saved.slice(0, 80)),
        );
      } else {
        const response = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmed, mood }),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(data.error || "投递没有成功");
      }

      const replyResponse = await fetch("/api/comfort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, mood }),
      });
      const replyData = (await replyResponse.json()) as {
        reply?: string;
        heard?: string;
        urgent?: boolean;
      };
      setBotReply(
        replyData.reply || "嗯，我看完啦。先别急着逼自己想通，我陪你坐一会儿。",
      );
      setHeard(replyData.heard || "你此刻真正想说的事");
      setUrgentReply(Boolean(replyData.urgent));
      setContent("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "刚才没有收好，再试一次吧。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="inner-page write-page-v2">
      <CalmBackground />
      <InnerHeader />
      <section className="writing-wrap">
        <div className="writing-companion">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/capybara-avatar.webp" alt="原创水豚伙伴小岸" />
          <div>
            <span>小岸趴在桌边</span>
            <p>你想到哪儿就说到哪儿，我不会打断。</p>
          </div>
        </div>

        <div className="section-intro compact-intro">
          <p className="handwritten-kicker">我把小耳朵擦干净啦</p>
          <h1>说吧，我在听呢</h1>
          <p>别想着怎么写才好看。你说你的，我先把心事接住。</p>
        </div>

        <div className="writing-paper">
          <div className="paper-note">今天只聊你的感受</div>
          <label htmlFor="thought">刚刚发生了什么？</label>
          <textarea
            id="thought"
            value={content}
            maxLength={1500}
            onChange={(event) => setContent(event.target.value)}
            placeholder={"从哪里说都行，我不赶时间。\n写乱一点也没关系，我看得懂。"}
          />
          <div className="count">{content.length} / 1500</div>

          <fieldset className="mood-field">
            <legend>选一个最接近的心情</legend>
            <div className="mood-list">
              {moods.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={mood === item ? "selected" : ""}
                  onClick={() => setMood(item)}
                >
                  <span aria-hidden="true">{moodIcons[item]}</span> {item}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="delivery-grid">
            <button
              type="button"
              className={`delivery-card ${mode === "private" ? "selected" : ""}`}
              onClick={() => setMode("private")}
            >
              <span>藏在小岸的抽屉里</span>
              <strong>只留给自己</strong>
              <small>安安静静陪着你，不给别人看</small>
            </button>
            <button
              type="button"
              className={`delivery-card ${mode === "public" ? "selected" : ""}`}
              onClick={() => setMode("public")}
            >
              <span>让同频的人捡到</span>
              <strong>放进海边漂流瓶</strong>
              <small>也许会收到一句“嗯，我懂”</small>
            </button>
          </div>

          <div className="submit-row">
            <p>{message || "交给我吧，我会好好读。"}</p>
            <button
              className="soft-submit"
              type="button"
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? "小岸正捧着信读…" : "写好了，给小岸"}
            </button>
          </div>
        </div>
      </section>

      {botReply && (
        <div className="encouragement-layer" role="dialog" aria-modal="true">
          <div className={`robot-letter ${urgentReply ? "urgent-letter" : ""}`}>
            <div className="robot-letter-head">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/capybara-avatar.webp" alt="水豚小岸" />
              <div>
                <strong>小岸趴在信纸上回你</strong>
                <span>嗯，我听懂你在说：{heard}</span>
              </div>
            </div>
            <p>{botReply}</p>
            <small>如果这件事已经压得你喘不过气，记得也去找现实里信得过的人陪陪你。</small>
            <button type="button" onClick={() => setBotReply("")}>
              嗯，收到啦
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
