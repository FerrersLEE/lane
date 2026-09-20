---
title: 个人知识博客
description: 用 Astro 5 + MDX 从零搭建的个人技术博客，部署在 Cloudflare Pages。记录开发过程中踩过的坑与修复过程。
tags: [astro, cloudflare, blog, web-dev]
published: 2026-08-21
updated: 2026-09-20
status: 进行中
techStack: [Astro 5, MDX, TypeScript, Cloudflare Pages, KaTeX]
repoUrl: https://github.com/FerrersLEE/lane
demoUrl: https://lane-e01.pages.dev
---

# 个人知识博客

一个用 **Astro 5 + MDX** 搭建的静态技术博客，部署在 Cloudflare Pages。用于沉淀学习笔记、项目记录和安全研究内容。

## 技术栈

- **框架**：Astro 5（零 JS 运行时、内容集合、MDX）
- **样式**：原生 CSS（设计系统 + CSS 变量）
- **字体**：Fraunces（衬线标题）、JetBrains Mono（等宽）
- **部署**：Cloudflare Pages + GitHub 自动构建
- **数学公式**：KaTeX
- **代码高亮**：Shiki（Astro 内置）

## 功能特性

- 📝 **内容集合**：笔记（Notes）和项目（Programs）两个内容类型，支持草稿、标签、自定义字段
- 🔍 **全文搜索**：构建时生成索引，支持标题/标签/摘要/正文检索，结果按相关度排序
- 🏷️ **标签系统**：标签云 + 单标签分类页，自动统计数量
- 🌙 **深色模式**：localStorage 持久化，首屏防闪烁
- ⏱️ **阅读时间估算**：按中文 400 字/分钟自动计算
- ↔️ **上下篇导航**：按发布时间自动串联
- 📖 **文章目录**：自动从 h2/h3 生成 TOC
- 📋 **代码复制**：CSDN 风格，每个代码块右上角悬浮复制按钮
- 📊 **阅读进度条**：顶部进度条跟随滚动变化
- 📡 **RSS 订阅**：自动生成，笔记和项目都会出现在订阅源
- 🗺️ **Sitemap**：自动生成站点地图
- 🔗 **SEO**：Open Graph、Twitter Card、JSON-LD 结构化数据
- 📱 **响应式**：桌面 / 平板 / 手机三端适配
- ⚡ **性能**：静态生成，图片自动优化为 webp

## 开发过程中的 Bug 与修复

### 1. astro.config.mjs 缺失

**问题**：项目能构建但缺少核心配置文件，导致站点元信息、插件（sitemap 等）、markdown 配置都不完整。

**修复**：创建 `astro.config.mjs`，配置站点 URL、MDX 集成、sitemap 插件、Shiki 代码高亮主题等。

### 2. RSS 是硬编码的静态文件

**问题**：最初 `rss.xml` 是手写的静态文件，新增文章不会自动更新。

**修复**：改用 Astro 的 `getStaticPaths` + `getCollection` 动态生成，笔记和项目都会自动按时间倒序出现在订阅源里。

### 3. 搜索页只是占位

**问题**：搜索页只有一个输入框，没有实际搜索功能。

**修复**：
- 构建时用 `getStaticPaths` 生成 `/search-index.json` 搜索索引
- 前端 JS 实现 debounce 搜索、相关度评分（标题 > 标签 > 描述 > 正文）
- 关键词高亮、搜索摘要
- 支持 URL 参数 `?q=` 和键盘快捷键 `/` 聚焦、`Esc` 清空

### 4. 标签链接被当成纯文本显示

**问题**：文章顶部的标签显示成了 `<a href=...>` 原始 HTML 代码。

**原因**：在 Astro JSX 中用模板字符串拼接 HTML 后直接输出，会被转义成纯文本。

**修复**：改成真正的 JSX 元素渲染：

```jsx
// ❌ 错误
{tags.map(tag => `<a href="/tags/${tag}">#${tag}</a>`).join(" ")}

// ✅ 正确
{tags.map(tag => (
  <a href={`/tags/${tag}`}>#{tag}</a>
))}
```

### 5. is:inline 脚本没有执行

**问题**：代码块复制按钮、目录生成、暗黑模式切换等 JS 功能全部不生效。

**原因**：`is:inline` 脚本被错误地包在了花括号和模板字符串里，Astro 把它当成了表达式而不是脚本内容：

```astro
<!-- ❌ 错误 -->
<script is:inline>{
  `console.log('hello')`
}</script>

<!-- ✅ 正确 -->
<script is:inline>
  console.log('hello')
</script>
```

**修复**：去掉花括号和反引号，直接在 `<script is:inline>` 里写 JS 代码。

### 6. 笔记详情页和项目详情页样式不统一

**问题**：最早的两篇文章（first-note 和 knowledge-blog）是独立的 `.astro` 页面文件，不走动态路由，改了新样式后这两篇还是旧的。

**原因**：Astro 中 `pages/xxx/index.astro` 这种基于文件的路由优先级高于动态路由 `[...slug].astro`。

**修复**：删除独立的页面文件，所有文章统一走内容集合 + 动态路由，保证样式一致。

### 7. 计网笔记的图片 404

**问题**：计算机网络笔记里两张链路示意图不显示，返回 404。

**原因**：图片是用原始 HTML `<img>` 标签写的（从飞书/Word 粘贴过来，还带了 `style="zoom:33%"`），Astro 只处理 Markdown 的 `![]()` 语法，不会解析 HTML 标签里的相对路径。

**修复**：把 `<img>` 改回标准 Markdown 图片语法：

```markdown
![t=0.1s 链路被100bit填满](./imgs/t01s_链路被100bit填满.png)
```

改完后 Astro 的图片优化插件会自动处理，输出优化后的 webp 格式。

### 8. 文章图片被拉高变形

**问题**：图片能显示了，但比例不对，宽图被拉成了接近正方形的高块。

**原因**：Astro 自动给 `<img>` 加了 `width="1696" height="690"` 属性，而 CSS 只写了 `max-width: 100%` 却漏了 `height: auto`。宽度被容器压缩后，高度仍按属性值渲染，导致比例失真。

**修复**：全局补充 `img { height: auto; }`，确保图片按原始宽高比缩放。

## 部署

代码推送到 GitHub 后，Cloudflare Pages 会自动构建并部署。构建命令 `npm run build`，输出目录 `dist`。

## 仓库

- GitHub：[github.com/FerrersLEE/lane](https://github.com/FerrersLEE/lane)
- 在线预览：[lane-e01.pages.dev](https://lane-e01.pages.dev)
