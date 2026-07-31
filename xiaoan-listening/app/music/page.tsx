"use client";

import { useEffect, useState } from "react";
import { CalmBackground, CapybaraAside, InnerHeader } from "../ui";

type Song = {
  id: number;
  title: string;
  artist: string;
  platform: string;
  url: string;
  note: string;
};

const platforms = ["网易云音乐", "QQ音乐", "Apple Music"];

export default function MusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState(platforms[0]);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);

  const loadSongs = () => {
    fetch("/api/songs")
      .then(async (response) => {
        const data = (await response.json()) as { songs?: Song[] };
        return response.ok ? data.songs || [] : [];
      })
      .then(setSongs)
      .catch(() => setSongs([]));
  };

  useEffect(loadSongs, []);

  const share = async () => {
    setSending(true);
    setNotice("");
    try {
      const response = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, platform, url, note }),
      });
      const data = (await response.json()) as { song?: Song; error?: string };
      if (!response.ok || !data.song) throw new Error(data.error || "分享没有成功");
      setSongs((items) => [data.song as Song, ...items]);
      setTitle("");
      setUrl("");
      setNote("");
      setNotice("已经放进同频歌单啦，也许下一秒就会遇见耳机里的知己。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "分享没有成功");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="inner-page music-page">
      <CalmBackground />
      <InnerHeader />
      <section className="wide-wrap music-wrap">
        <div className="section-intro centered">
          <p className="eyebrow">小岸把耳机分你一边</p>
          <h1>把耳机里舍不得跳过的歌，留在海边</h1>
          <p>不比榜单，只分享“为什么这一首刚好懂我”。</p>
        </div>
        <CapybaraAside>你喜欢的歌一定藏着一点你。我戴好耳机啦。</CapybaraAside>

        <div className="music-share-card">
          <div className="music-share-copy">
            <span className="music-shell">♪</span>
            <h2>投递一首你的私藏</h2>
            <p>在音乐 App 里复制分享链接就好，剩下的交给小岸。</p>
          </div>
          <div className="music-form">
            <label>歌名<input value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} placeholder="比如：Mystery of Love" /></label>
            <div className="platform-list" aria-label="选择音乐平台">
              {platforms.map((item) => (
                <button type="button" className={platform === item ? "selected" : ""} key={item} onClick={() => setPlatform(item)}>{item}</button>
              ))}
            </div>
            <label>官方分享链接<input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="粘贴 QQ音乐 / 网易云音乐 / Apple Music 分享链接" /></label>
            <label>为什么想分享它<textarea value={note} maxLength={120} onChange={(event) => setNote(event.target.value)} placeholder="比如：前奏一响，像傍晚一个人走到海边。" /></label>
            <div className="music-submit-row">
              <span>{notice || `${note.length} / 120`}</span>
              <button type="button" disabled={sending} onClick={() => void share()}>{sending ? "正在放进漂流瓶…" : "投进同频歌单"}</button>
            </div>
          </div>
        </div>

        <div className="song-list">
          <div className="song-list-heading"><h2>海边正在播放</h2><span>{songs.length ? `${songs.length} 首同频私藏` : "第一首歌，正等你放进来"}</span></div>
          {songs.length === 0 ? (
            <div className="song-empty"><span>♫</span><p>这里还很安静。第一首被认真分享的歌，会成为这座岛的开场曲。</p></div>
          ) : (
            songs.map((song, index) => (
              <article className="song-card" key={song.id}>
                <span className="song-index">{String(index + 1).padStart(2, "0")}</span>
                <div><small>{song.platform}</small><h3>{song.title}</h3></div>
                <blockquote>“{song.note}”</blockquote>
                <a href={song.url} target="_blank" rel="noreferrer">去原平台听 <span>↗</span></a>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
