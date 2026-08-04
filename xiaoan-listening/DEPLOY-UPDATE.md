# 小岸在听呢｜本次更新部署说明

这次更新已经通过 `npm run build:vercel` 正式构建检查。

本次包已包含：新版页面结构、手机端自适配、我的海岸、回复反馈，以及“常用心情 + 四组细分心情”的新版选择器。

## 你要做的事

1. 下载并解压我提供的更新包。
2. 打开 GitHub 仓库 `dwy0591-lang/xiaoan-listening`。
3. 进入仓库最外层，点击 `Add file` → `Upload files`。
4. 把解压后名为 `xiaoan-listening` 的整个文件夹拖进去。GitHub 会合并同名文件夹，不要把文件单独传进 `app/api`。
5. 页面底部填写 `更新网站结构和手机端适配`，点击两次 `Commit changes`。
6. 打开 Vercel 项目 `xiaoan-listening` → `Deployments`，等待最新一条变成绿色 `Ready`。
7. 打开 `https://www.xiaoanzaiting.com`，用电脑和手机各测试一次。

## 不需要重做

- 不用重新买域名或配置 DNS、SSL。
- 不用重新连接 Supabase。
- 不用重新填写 ARK 大模型环境变量。
- 不用重新创建 Vercel 项目。

## 建议验收路径

首页 → 说给小岸 → 选择情绪 → 私密收纳 → 查看 AI 回信 → 让小岸陪我做一件小事 → 完成任务 → 我的海岸。

再测试：同频海滩、同频歌单、闪光贝壳、导出记录，以及手机底部四个导航入口。
