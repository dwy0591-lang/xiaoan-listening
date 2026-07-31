# 把「小岸在听呢」公开上线

这份代码已经按 Vercel 的 Next.js 构建方式配置并通过生产构建测试。你不需要改代码。

## 第一步：把代码放到 GitHub

1. 下载并解压代码包。
2. 登录 GitHub，点击右上角 **＋ → New repository**。
3. Repository name 建议填写 `xiaoan-listening`，选择 **Public** 或 **Private** 都可以。
4. 不要勾选“Add a README file”，直接点击 **Create repository**。
5. 在新仓库页面点击 **uploading an existing file**。
6. 把解压后文件夹里的全部文件拖进去，等待上传完成，点击 **Commit changes**。

注意：拖进去的是“文件夹里面的全部内容”，不是 ZIP 压缩包本身。

## 第二步：让 Vercel 上线网页

1. 登录 Vercel，建议直接用刚才的 GitHub 账号登录。
2. 点击 **Add New → Project**。
3. 找到 `xiaoan-listening`，点击 **Import**。
4. Framework Preset 应显示 **Next.js**；其余保持默认，点击 **Deploy**。
5. 等待部署完成。Vercel 会给你一个类似 `xiaoan-listening.vercel.app` 的网址，这个才是可以分享给朋友的公开地址。

到这里，网页已经可以打开。下面继续连接数据库，让朋友能够公开投递、留言和分享歌单。

## 第三步：连接免费 Supabase 数据库

1. 打开你的 Vercel 项目，进入 **Storage** 或 **Marketplace**。
2. 搜索 **Supabase**，点击 **Add Integration**，新建或连接一个免费 Supabase 项目。
3. 连接后，Vercel 会自动加入数据库环境变量。
4. 打开 Supabase 项目，进入 **SQL Editor → New query**。
5. 在代码包中打开 `supabase-schema.sql`，复制全部内容，粘贴到 SQL Editor，点击 **Run**。
6. 回到 Vercel 项目，进入 **Deployments**，点最新部署右侧菜单，选择 **Redeploy**。

## 第四步：校正分享卡片的网址

1. 在 Vercel 项目进入 **Settings → Environment Variables**。
2. 新增：
   - Name：`NEXT_PUBLIC_SITE_URL`
   - Value：你刚得到的完整网址，例如 `https://xiaoan-listening.vercel.app`
3. 保存后再 **Redeploy** 一次。

这样微信或其他平台读取分享卡片、站点地图和二维码时，都会指向你的新网址。

## 上线后检查这 6 项

- 首页、说给小岸、同频海滩、开心一下、闪光贝壳、同频歌单都能打开
- 切换页面时背景音不断开（浏览器可能要求第一次点击后才允许播放）
- 可以公开投递一条测试心事
- 可以给测试心事留言
- 可以投递并抽取一条闪光贝壳
- 分享按钮生成的链接以 `.vercel.app` 结尾

## 常见问题

**朋友打不开旧的 `chatgpt.site` 地址？** 以后只分享 Vercel 部署成功页面显示的 `.vercel.app` 地址。

**Vercel 显示数据库未配置？** 确认 Supabase Integration 已连接，然后 Redeploy；环境变量只会进入连接后的新部署。

**想换更短的网址？** 可在 **Settings → Domains** 中修改项目的 `.vercel.app` 域名；名字是否可用取决于是否已被别人占用。
