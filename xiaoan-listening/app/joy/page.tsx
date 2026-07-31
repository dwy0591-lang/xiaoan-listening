"use client";

import { useState } from "react";
import { CalmBackground, InnerHeader } from "../ui";

type JoyTask = {
  id: string;
  icon: string;
  title: string;
  note: string;
  color: string;
};

type JoyRecord = JoyTask & {
  completedAt: string;
  reward: string;
};

const joyTasks: JoyTask[] = [
  { id: "milk-tea", icon: "◡", title: "给自己点杯奶茶", note: "今天先甜这一小口", color: "oat" },
  { id: "walk", icon: "⌇", title: "下楼散一小圈", note: "不用走远，让风吹吹脑袋", color: "green" },
  { id: "sunset", icon: "◒", title: "去看一场日落", note: "把今天交给天空慢慢收尾", color: "peach" },
  { id: "show", icon: "⌁", title: "打开一个好笑的综艺", note: "允许脑子下班半小时", color: "blue" },
  { id: "hotel", icon: "▱", title: "去酒店点外卖看剧", note: "偶尔换个房间，也像短暂出逃", color: "lilac" },
  { id: "cook", icon: "♨", title: "做顿只合自己口味的饭", note: "今天不迁就任何人的口味", color: "oat" },
  { id: "sing", icon: "♪", title: "戴上耳机唱一首歌", note: "不用好听，唱出来就很痛快", color: "blue" },
  { id: "bath", icon: "≈", title: "洗个热乎乎的澡", note: "先把今天的疲惫冲掉一点", color: "green" },
];

const rewards = [
  "你没有等快乐自己敲门，是你亲手给今天开了一扇小窗。",
  "做得好呀。会哄自己开心的人，已经在慢慢成为自己的靠山了。",
  "这件事看起来小小的，可你刚刚认真照顾了自己的感受。小岸看见啦。",
  "恭喜你把自己从坏情绪里轻轻抱出来了一点点，不用更多，这样就很好。",
  "小岸郑重宣布：今天的你，获得了‘很会爱自己’小奖章。",
];

function readList<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function JoyPage() {
  const [selected, setSelected] = useState(joyTasks[0].id);
  const [active, setActive] = useState<JoyTask | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = JSON.parse(localStorage.getItem("little-shore-active-joy") || "null") as JoyTask | null;
      return saved?.id ? saved : null;
    } catch {
      return null;
    }
  });
  const [records, setRecords] = useState<JoyRecord[]>(() =>
    typeof window === "undefined" ? [] : readList<JoyRecord>("little-shore-joy-records"),
  );
  const [surprise, setSurprise] = useState<JoyRecord | null>(null);
  const [exportNotice, setExportNotice] = useState("");

  const chooseForMe = () => {
    const next = joyTasks[Math.floor(Math.random() * joyTasks.length)];
    setSelected(next.id);
  };

  const start = () => {
    const task = joyTasks.find((item) => item.id === selected) || joyTasks[0];
    setActive(task);
    localStorage.setItem("little-shore-active-joy", JSON.stringify(task));
  };

  const complete = () => {
    if (!active) return;
    const record: JoyRecord = {
      ...active,
      completedAt: new Date().toISOString(),
      reward: rewards[Math.floor(Math.random() * rewards.length)],
    };
    const next = [record, ...records].slice(0, 100);
    setRecords(next);
    setActive(null);
    setSurprise(record);
    localStorage.setItem("little-shore-joy-records", JSON.stringify(next));
    localStorage.removeItem("little-shore-active-joy");
  };

  const exportRecords = () => {
    const thoughts = readList<{ content: string; mood: string; createdAt: string }>(
      "weiguang-private-thoughts",
    );
    const glows = readList<{ content: string; createdAt: string }>("little-shore-glows");
    const joys = readList<JoyRecord>("little-shore-joy-records");
    const lines = [
      "小岸替我收好的记录",
      `导出时间：${new Date().toLocaleString("zh-CN")}`,
      "",
      "—— 我的心事 ——",
      ...(thoughts.length
        ? thoughts.map((item) => `[${formatTime(item.createdAt)} · ${item.mood}]\n${item.content}`)
        : ["还没有私密心事。"]),
      "",
      "—— 我哄自己开心的小事 ——",
      ...(joys.length
        ? joys.map((item) => `[${formatTime(item.completedAt)}] ${item.title}\n小岸说：${item.reward}`)
        : ["还没有完成记录。"]),
      "",
      "—— 我存下的闪光 ——",
      ...(glows.length
        ? glows.map((item) => `[${formatTime(item.createdAt)}] ${item.content}`)
        : ["还没有闪光记录。"]),
      "",
      "这些文字来自“小岸在听呢”，只保存在你的设备里。",
    ];
    const file = new Blob([lines.join("\n\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `小岸替我收好的记录-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setExportNotice("装好啦，已经放进你的下载文件里。");
    window.setTimeout(() => setExportNotice(""), 2600);
  };

  return (
    <main className="inner-page joy-page">
      <CalmBackground />
      <InnerHeader />
      <section className="joy-wrap">
        <div className="section-intro centered joy-intro">
          <p className="eyebrow">小岸的开心处方，不用挂号</p>
          <h1>先不解决人生，去哄自己开心一下</h1>
          <p>挑一件现在做得到的小事。不是打卡，也不用坚持，今天舒服一点就算赢。</p>
        </div>

        <div className="joy-pick-row">
          <div>
            <span>今天想用哪种方式抱抱自己？</span>
            <small>点一下卡片，小岸就替你记着</small>
          </div>
          <button type="button" onClick={chooseForMe}>不知道做什么，让小岸挑</button>
        </div>

        <div className="joy-task-grid">
          {joyTasks.map((task) => (
            <button
              className={`joy-task-card ${task.color} ${selected === task.id ? "selected" : ""}`}
              type="button"
              key={task.id}
              onClick={() => setSelected(task.id)}
            >
              <span className="joy-task-icon" aria-hidden="true">{task.icon}</span>
              <strong>{task.title}</strong>
              <small>{task.note}</small>
              <i>{selected === task.id ? "就它啦" : "选这个"}</i>
            </button>
          ))}
        </div>

        {!active ? (
          <div className="joy-start-row">
            <p>不用等心情完全准备好，先迈一小步。</p>
            <button type="button" onClick={start}>好，我去做这件小事</button>
          </div>
        ) : (
          <section className="joy-in-progress">
            <div className="mini-capybara">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/capybara-avatar.webp" alt="水豚小岸" />
              <span>小岸替你守着这张小纸条</span>
            </div>
            <div>
              <small>你刚刚答应自己的事</small>
              <h2>{active.title}</h2>
              <p>慢慢来，做完再回来。中途改变主意也没关系。</p>
            </div>
            <button type="button" onClick={complete}>我回来啦，做到了</button>
          </section>
        )}

        <section className="joy-records">
          <div className="joy-records-head">
            <div>
              <p className="eyebrow">我有在好好照顾自己</p>
              <h2>被小岸记住的开心小事</h2>
            </div>
            <button className="export-button" type="button" onClick={exportRecords}>
              ↓ 导出我的记录
            </button>
          </div>
          {exportNotice && <p className="export-notice">{exportNotice}</p>}
          {records.length ? (
            <div className="joy-record-list">
              {records.slice(0, 6).map((record) => (
                <article key={`${record.id}-${record.completedAt}`}>
                  <span>{record.icon}</span>
                  <div><strong>{record.title}</strong><small>{formatTime(record.completedAt)}</small></div>
                  <i>做到了</i>
                </article>
              ))}
            </div>
          ) : (
            <div className="joy-empty">第一件开心小事，等你做完回来告诉小岸。</div>
          )}
          <p className="record-privacy">心事、开心小事和你存下的闪光会一起导出；文件只会下载到你的设备。</p>
        </section>
      </section>

      {surprise && (
        <div className="joy-reward-layer" role="dialog" aria-modal="true" aria-label="小岸送来的惊喜">
          <div className="joy-reward-card">
            <div className="reward-sparkles" aria-hidden="true"><i>♡</i><i>✦</i><i>♡</i></div>
            <div className="reward-capybara">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/capybara-avatar.webp" alt="开心转圈的水豚小岸" />
              <span>小岸正在开心转圈</span>
            </div>
            <p className="eyebrow">叮——你拆到一张水豚夸夸卡</p>
            <h2>“{surprise.title}”完成啦！</h2>
            <p>{surprise.reward}</p>
            <div className="reward-stamp">今日份 · 会哄自己的小画家</div>
            <button type="button" onClick={() => setSurprise(null)}>把这张夸夸卡收好</button>
          </div>
        </div>
      )}
    </main>
  );
}
