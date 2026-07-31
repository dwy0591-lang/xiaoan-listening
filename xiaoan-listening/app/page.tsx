"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AmbientAudio, CalmBackground, SharePosterButton, ShareSiteButton, SiteMark } from "./ui";

const gentleLines = [
  "我在岸边给你留了位置，不用解释，坐就好。",
  "我不太会讲大道理，但会把你的话听完。",
  "水豚不催你振作，你今天慢一点也没关系。",
  "我把海风分你一半，烦恼也可以分我一点。",
  "你发现的那些小小美好，我也想听。",
  "今天没做到满分？没事，我游泳也偶尔会呛水。",
];

export default function Home() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setLineIndex((value) => (value + 1) % gentleLines.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="page-shell home-page home-v2">
      <CalmBackground />
      <header className="topbar">
        <SiteMark />
        <div className="header-actions">
          <ShareSiteButton />
          <AmbientAudio />
        </div>
      </header>

      <section className="seaside-hero" aria-labelledby="welcome-title">
        <div className="seaside-copy">
          <div className="soft-badge">
            <span>○</span> 敏感有天赋 · 温柔有力量
          </div>
          <p className="handwritten-kicker">小岸写给每一位小画家</p>
          <h1 id="welcome-title">
            累了就来吧，
            <br />
            我给你留了海边的位置
          </h1>
          <p className="lead">
            我是小岸，一只不太会讲大道理的水豚。
            <br />
            但我很会安静陪你。没说出口的话，放我这儿就好。
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/write">
              <span>坐到小岸旁边</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="quiet-link" href="/plaza">
              去海边看看大家
            </Link>
            <SharePosterButton />
          </div>
          <p className="privacy-note">你总能发现别人错过的小美好，也别忘了回头看看自己的可爱呀。</p>
        </div>

        <div className="hero-illustration-wrap">
          <div className="postcard-tape" aria-hidden="true" />
          {/* A pre-compressed local WebP avoids runtime image-optimizer dependencies. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hero-illustration"
            src="/hero-capybara-seaside.webp"
            alt="原创水豚小岸坐在淡绿色草地上，身后是安静的蓝色大海"
          />
          <div className="mascot-note">
            <strong>小岸</strong>
            <span>会认真听，也不会催你</span>
          </div>
        </div>
      </section>

      <aside className="floating-line" aria-live="polite">
        <span>✦</span>
        <p key={lineIndex}>{gentleLines[lineIndex]}</p>
      </aside>
    </main>
  );
}
