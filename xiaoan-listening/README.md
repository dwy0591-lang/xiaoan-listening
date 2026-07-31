# 小岸在听呢

面向 ISFP 与所有柔软敏感人群的匿名情绪海岸。包含说给小岸、同频海滩、闪光贝壳和同频歌单。

## 功能

- 私密心事保存在浏览器 `localStorage`，不上传服务器
- 公开心事、暖心留言、微光鼓励使用在线数据库
- 服务端拦截常见说教、批判与攻击性留言
- 两段真实海浪录音与完整肖邦夜曲，可调音量并在页面切换时连续播放
- 低饱和莫兰迪视觉，响应式适配手机与电脑
- 尊重 `prefers-reduced-motion`，减少动态效果

## 本地运行

```bash
npm install
npm run dev
```

## 部署到 Vercel（新手版）

完整图文式步骤见 [`开始部署到Vercel.md`](./开始部署到Vercel.md)。最短流程是：

1. 将解压后的全部文件上传到一个新的 GitHub 仓库。
2. 在 Vercel 点击 **Add New → Project**，导入这个仓库并点击 **Deploy**。
3. Vercel 会自动分配一个可公开分享的 `项目名.vercel.app` 免费网址。
4. 在 Vercel Marketplace 连接 Supabase，然后在 Supabase SQL Editor 运行 `supabase-schema.sql`。
5. 在 Vercel 重新部署一次，公共树洞、留言、鼓励盒、歌单和访问统计即可正常保存。

项目中的 `vercel.json` 已配置标准 Next.js 构建。服务端密钥只在 API 中使用，不会发送给浏览器。

## 数据说明

- 私密收纳仅存在当前浏览器，清除浏览器数据或更换设备后无法恢复。
- 公开数据在部署到 ChatGPT Sites 时使用 D1；部署到 Vercel 时自动使用 Supabase。
- 这是匿名情绪支持产品，不替代专业心理咨询或紧急援助。
