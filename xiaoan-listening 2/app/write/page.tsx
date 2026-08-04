"use client";

import Link from "next/link";
import { useState } from "react";
import { CalmBackground, InnerHeader } from "../ui";

const quickMoods = [
  "自我内耗",
  "焦虑不安",
  "委屈难过",
  "生气烦躁",
  "有点孤独",
  "迷茫没方向",
  "偶尔欣喜",
];

const moodGroups = [
  {
    title: "心里有点沉",
    hint: "像潮水压在胸口",
    items: ["低落没劲", "想哭一下", "失望了", "麻木空白"],
  },
  {
    title: "脑袋停不下来",
    hint: "一件事反复绕圈",
    items: ["后悔自责", "害怕失败", "选择困难", "压力很大"],
  },
  {
    title: "和别人有关",
    hint: "有些话卡在关系里",
    items: ["被误解", "关系别扭", "被忽视", "想念某人", "舍不得", "渴望被看见"],
  },
  {
    title: "也有一点亮",
    hint: "今天不全是坏天气",
    items: ["松了一口气", "被治愈", "有点期待", "为自己骄傲"],
  },
];

const moodIcons: Record<string, string> = {
  自我内耗: "☁",
  焦虑不安: "≈",
  委屈难过: "〰",
  生气烦躁: "♨",
  有点孤独: "☾",
  迷茫没方向: "⌁",
  偶尔欣喜: "☀",
  低落没劲: "∿",
  想哭一下: "◡",
  失望了: "⋯",
  麻木空白: "○",
  后悔自责: "↶",
  害怕失败: "△",
  选择困难: "⇆",
  压力很大: "≋",
  被误解: "◌",
  关系别扭: "⌇",
  被忽视: "◍",
  想念某人: "☾",
  舍不得: "∞",
  渴望被看见: "✦",
  松了一口气: "≈",
  被治愈: "❀",
  有点期待: "⌁",
  为自己骄傲: "✧",
};

type SavedThought = {
  id: string;
  content: string;
  mood: string;
  createdAt: string;
};

export default function WritePage() {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(quickMoods[0]);
  const [mode, setMode] = useState<"private" | "public">("private");
  const [message, setMessage] = useState("");
  const [botReply, setBotReply] = useState("");
  const [heard, setHeard] = useState("");
  const [urgentReply, setUrgentReply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAllMoods, setShowAllMoods] = useState(false);
  const [submittedContent, setSubmittedContent] = useState("");
  const [replySaved, setReplySaved] = useState(false);
  const [feedback, setFeedback] = useState<"understood" | "missed" | "">("");

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
      setSubmittedContent(trimmed);
      setReplySaved(false);
      setFeedback("");
      setContent("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "刚才没有收好，再试一次吧。");
    } finally {
      setSubmitting(false);
    }
  };

  const saveLetter = () => {
    if (!submittedContent || !botReply || replySaved) {
      setBotReply("");
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem("little-shore-letters") || "[]") as Array<{
        id: string;
        content: string;
        mood: string;
        heard: string;
        reply: string;
        createdAt: string;
      }>;
      saved.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        content: submittedContent,
        mood,
        heard,
        reply: botReply,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("little-shore-letters", JSON.stringify(saved.slice(0, 80)));
      setReplySaved(true);
    } finally {
      setBotReply("");
    }
  };

  const leaveFeedback = (value: "understood" | "missed") => {
    setFeedback(value);
    try {
      const saved = JSON.parse(localStorage.getItem("little-shore-reply-feedback") || "[]") as unknown[];
      saved.unshift({ value, mood, createdAt: new Date().toISOString() });
      localStorage.setItem("little-shore-reply-feedback", JSON.stringify(saved.slice(0, 100)));
    } catch {
      localStorage.setItem(
        "little-shore-reply-feedback",
        JSON.stringify([{ value, mood, createdAt: new Date().toISOString() }]),
      );
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
            <p className="mood-picker-note">选不准也没关系，挑一个现在最像你的就好。</p>
            <div className="mood-list">
              {quickMoods.map((item) => (
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
            {showAllMoods ? (
              <div className="mood-catalog">
                {moodGroups.map((group) => (
                  <section className="mood-group" key={group.title}>
                    <div className="mood-group-title">
                      <strong>{group.title}</strong>
                      <span>{group.hint}</span>
                    </div>
                    <div className="mood-list">
                      {group.items.map((item) => (
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
                  </section>
                ))}
              </div>
            ) : null}
            <button className="mood-more" type="button" onClick={() => setShowAllMoods((value) => !value)}>
              {showAllMoods ? "先收起来" : "没找到？看看更细的心情"}
            </button>
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

          <p className="delivery-privacy">
            {mode === "private"
              ? "这封心事只保存在你的浏览器；为了让小岸回信，文字会安全发送给豆包大模型处理，但不会出现在同频海滩。"
              : "这封心事会匿名出现在同频海滩，也会发送给豆包大模型生成一封只给你的回信。"}
          </p>

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
            <div className="reply-feedback" aria-label="这封回信是否贴近你的感受">
              <span>这次小岸听懂了吗？</span>
              <button className={feedback === "understood" ? "selected" : ""} type="button" onClick={() => leaveFeedback("understood")}>听懂我了</button>
              <button className={feedback === "missed" ? "selected" : ""} type="button" onClick={() => leaveFeedback("missed")}>有点答非所问</button>
            </div>
            <small>如果这件事已经压得你喘不过气，记得也去找现实里信得过的人陪陪你。</small>
            <div className="reply-actions">
              <button type="button" onClick={saveLetter}>收下这封回信</button>
              <Link href={`/joy?mood=${encodeURIComponent(mood)}`} onClick={saveLetter}>让小岸陪我做一件小事</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
