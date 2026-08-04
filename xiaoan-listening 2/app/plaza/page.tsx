"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalmBackground, CapybaraAside, InnerHeader } from "../ui";

type Comment = { id: number; content: string; createdAt: string };
type Post = {
  id: number;
  content: string;
  mood: string;
  createdAt: string;
  comments: Comment[];
};

const prompts = ["嗯，我懂你", "你已经做得很好啦"];
const quietFallback: Post[] = [
  {
    id: -1,
    mood: "被误解",
    content:
      "我常常想解释自己，又觉得语言太轻，装不下我真正的感受。后来我学着不急着证明，先站在自己这边。",
    createdAt: "",
    comments: [],
  },
  {
    id: -2,
    mood: "自我内耗",
    content:
      "今天开会时说错了一句话，我回家路上想了很久。写到这里，忽然觉得：可能大家早就忘了，我也可以放过自己。",
    createdAt: "",
    comments: [],
  },
  {
    id: -3,
    mood: "偶尔欣喜",
    content:
      "下班时看见云被夕阳染成淡紫色，买到了喜欢的面包。今天没有发生大事，但我偷偷喜欢今天。",
    createdAt: "",
    comments: [],
  },
];

export default function PlazaPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadNotice, setLoadNotice] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);
    fetch("/api/posts", { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as { posts?: Post[] };
        if (!response.ok) throw new Error("暂时无法连接");
        if (!data.posts?.length) {
          setLoadNotice("海滩今天有点安静，先读读小岸替你留下的几封信吧。");
          return quietFallback;
        }
        return data.posts;
      })
      .catch(() => {
        setLoadNotice("海浪刚刚把信件藏起来了。你仍然可以先看看这些示例来信，稍后再刷新。");
        return quietFallback;
      })
      .then((nextPosts) => {
        if (!active) return;
        setPosts(nextPosts);
        setLoading(false);
      });
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const leaveComment = async (postId: number) => {
    const content = drafts[postId]?.trim();
    if (!content) return;
    if (postId < 0) {
      setErrors((value) => ({ ...value, [postId]: "这是一封示例来信，正式上线后就能回应啦。" }));
      return;
    }
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content }),
    });
    const data = (await response.json()) as { comment?: Comment; error?: string };
    if (!response.ok || !data.comment) {
      setErrors((value) => ({ ...value, [postId]: data.error || "留言没有送达" }));
      return;
    }
    setPosts((value) =>
      value.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, data.comment as Comment] }
          : post,
      ),
    );
    setDrafts((value) => ({ ...value, [postId]: "" }));
    setErrors((value) => ({ ...value, [postId]: "" }));
  };

  return (
    <main className="inner-page plaza-page">
      <CalmBackground />
      <InnerHeader />
      <section className="wide-wrap">
        <nav className="section-tabs" aria-label="同频海滩分区">
          <Link className="active" href="/plaza">大家的漂流瓶</Link>
          <Link href="/music">大家在听</Link>
        </nav>
        <div className="section-intro centered">
          <span className="section-number">02</span>
          <p className="eyebrow">小岸把漂流瓶摆好了</p>
          <h1>海边也坐着一些和你很像的人</h1>
          <p>我一个人听不过来，所以把大家的话轻轻放在这里。</p>
        </div>
        <CapybaraAside>漂流瓶排好啦。你慢慢看，看到想抱抱的人就留一句话。</CapybaraAside>

        {loading ? (
          <div className="shore-loading" role="status"><span>≈</span><p>正在打开一封封匿名来信…</p></div>
        ) : (
          <>
          {loadNotice && <p className="plaza-notice">{loadNotice}</p>}
          <div className="masonry">
            {posts.map((post, index) => (
              <article className={`thought-card paper-${(index % 3) + 1}`} key={post.id}>
                <div className="thought-top">
                  <span>匿名来信 · {post.mood}</span>
                  <i>✦</i>
                </div>
                <p className="thought-content">{post.content}</p>
                <time>{formatDate(post.createdAt)}</time>

                {post.comments.length > 0 && (
                  <div className="comments">
                    {post.comments.map((comment) => (
                      <p key={comment.id}>
                        <span>海边回声</span>
                        {comment.content}
                      </p>
                    ))}
                  </div>
                )}

                <div className="prompt-row">
                  {prompts.map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      onClick={() =>
                        setDrafts((value) => ({ ...value, [post.id]: prompt }))
                      }
                    >
                      “{prompt}”
                    </button>
                  ))}
                </div>
                <div className="comment-box">
                  <textarea
                    aria-label="写下温柔回应"
                    maxLength={180}
                    value={drafts[post.id] || ""}
                    onChange={(event) =>
                      setDrafts((value) => ({
                        ...value,
                        [post.id]: event.target.value,
                      }))
                    }
                    placeholder="留下一句理解或安慰…"
                  />
                  <button
                    type="button"
                    aria-label="送出回应"
                    onClick={() => void leaveComment(post.id)}
                  >
                    ↗
                  </button>
                </div>
                {errors[post.id] && <p className="form-error">{errors[post.id]}</p>}
              </article>
            ))}
          </div>
          </>
        )}
      </section>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value.replace(" ", "T") + (value.includes("Z") ? "" : "Z"));
  if (Number.isNaN(date.getTime())) return "某个安静的时刻";
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 · 某个安静的时刻`;
}
