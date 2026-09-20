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

## 技术栈

- **框架**：Astro 5（零 JS 运行时、内容集合、MDX）
- **样式**：原生 CSS（设计系统 + CSS 变量）
- **字体**：Fraunces（衬线标题）、JetBrains Mono（等宽）
- **部署**：Cloudflare Pages + GitHub 自动构建
- **数学公式**：KaTeX
- **代码高亮**：Shiki（Astro 内置）

## 项目结构

```
lane/
├── public/                      # 静态资源（直接复制到输出根目录）
│   └── favicon.svg
├── src/
│   ├── content/                 # 内容集合（Markdown / MDX）
│   │   ├── notes/               # 笔记
│   │   │   ├── first-note/
│   │   │   │   └── index.md
│   │   │   └── computer-network/
│   │   │       └── w1/
│   │   │           ├── index.md
│   │   │           └── imgs/    # 笔记配图
│   │   └── programs/            # 项目
│   │       └── knowledge-blog/
│   │           └── index.md
│   ├── layouts/                 # 布局组件
│   │   └── BaseLayout.astro     # 全局布局（导航、页脚、主题切换）
│   ├── pages/                   # 页面路由
│   │   ├── index.astro          # 首页
│   │   ├── about.astro          # 关于页
│   │   ├── rss.xml.js           # RSS 动态生成
│   │   ├── search-index.json.js # 搜索索引
│   │   ├── notes/
│   │   │   ├── index.astro      # 笔记列表
│   │   │   └── [...slug].astro  # 笔记详情（动态路由）
│   │   ├── programs/
│   │   │   ├── index.astro      # 项目列表
│   │   │   └── [...slug].astro  # 项目详情（动态路由）
│   │   ├── tags/
│   │   │   ├── index.astro      # 标签云
│   │   │   └── [tag].astro      # 单标签页
│   │   └── search/
│   │       └── index.astro      # 搜索页
│   └── styles/
│       └── global.css           # 全局设计系统 + 组件样式
├── astro.config.mjs             # Astro 配置
├── content.config.ts            # 内容集合 Schema
├── package.json
└── tsconfig.json
```

### 核心概念

- **内容集合（Content Collections）**：`src/content/notes` 和 `src/content/programs` 是两个内容集合，用 `content.config.ts` 定义 Schema（字段、类型、必填项）。每篇文章是一个文件夹 + `index.md`，配图可以放在同级的 `imgs/` 里。
- **动态路由**：`[...slug].astro` 是 Astro 的动态路由语法，`slug` 就是文章的文件夹路径。构建时通过 `getStaticPaths()` 把所有文章渲染成静态页面。
- **静态生成**：`npm run build` 把所有页面预渲染成 HTML + CSS，输出到 `dist/` 目录，部署到任意静态托管平台都能跑。

## 功能特性

- **内容集合**：笔记（Notes）和项目（Programs）两个内容类型，支持草稿、标签、自定义字段
- **全文搜索**：构建时生成索引，支持标题/标签/摘要/正文检索，结果按相关度排序
- **标签系统**：标签云 + 单标签分类页，自动统计数量
- **深色模式**：localStorage 持久化，首屏防闪烁
- **阅读时间估算**：按中文 400 字/分钟自动计算
- **上下篇导航**：按发布时间自动串联
- **文章目录**：自动从 h2/h3 生成 TOC
- **代码复制**：CSDN 风格，每个代码块右上角悬浮复制按钮
- **阅读进度条**：顶部进度条跟随滚动变化
- **RSS 订阅**：自动生成，笔记和项目都会出现在订阅源
- **Sitemap**：自动生成站点地图
- **SEO**：Open Graph、Twitter Card、JSON-LD 结构化数据
- **响应式**：桌面 / 平板 / 手机三端适配
- **性能**：静态生成，图片自动优化为 webp

## 开发过程中的 Bug 与修复

### 1. astro.config.mjs 核心配置文件缺失

**现象**：项目能 `npm run build` 构建成功，线上也能访问，但总感觉少了什么——sitemap 没生成、站点 URL 是默认的、代码高亮主题不对。

**排查过程**：
1. 发现项目根目录下找不到 `astro.config.mjs`
2. 去 `node_modules/astro` 里翻了一下，确认 Astro 确实需要这个配置文件
3. 构建能成功是因为 Astro 有一套默认配置，缺失的字段会走默认值
4. 但默认值里站点 URL 是空的，sitemap 插件也没启用，导致 SEO 相关功能不完整

**根本原因**：项目是从模板初始化的，但核心配置文件在某次操作中被意外删除了，只剩源码文件。

**修复方案**：
```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lane-e01.pages.dev',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
```

**经验教训**：配置文件是项目的「地基」，即使能跑也不代表没问题。关键配置缺失会导致隐性功能降级。

### 2. RSS 订阅源是硬编码的静态文件

**现象**：发布新文章后，RSS 订阅源里看不到新内容，订阅者收不到更新提醒。

**排查过程**：
1. 打开 `rss.xml` 一看，发现里面只有两篇文章的内容
2. 文件是 `src/pages/rss.xml` 吗？不对，找了一下是 `src/pages/rss.xml.js`
3. 打开文件内容，发现整个 RSS 结构是用字符串拼出来的，文章列表是写死的数组
4. 也就是说，每发一篇文章都要手动去改这个文件加一条记录，非常容易忘

**根本原因**：最初的版本图省事，直接把 RSS 写成了静态字符串模板，没有和内容集合联动。

**修复方案**：
```js
// src/pages/rss.xml.js
import { getCollection } from 'astro:content';

export async function GET() {
  const notes = (await getCollection('notes', ({ data }) => !data.draft))
    .sort((a, b) => b.data.published - a.data.published);
  const programs = (await getCollection('programs', ({ data }) => !data.draft))
    .sort((a, b) => b.data.published - a.data.published);

  const items = [...notes, ...programs]
    .sort((a, b) => b.data.published - a.data.published);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Lane · 研究手帖</title>
    ...
    ${items.map(item => `
    <item>
      <title>${item.data.title}</title>
      <link>https://lane-e01.pages.dev/${item.collection}/${item.id}/</link>
      <description>${item.data.description}</description>
      <pubDate>${item.data.published.toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
```

**经验教训**：内容驱动的站点，所有列表类的输出（RSS、sitemap、搜索索引）都应该从内容集合动态生成，尽量不要手写。

### 3. 搜索页只是个空壳

**现象**：导航栏有「搜索」入口，点进去只有一个孤零零的输入框，输入任何内容都没反应。

**排查过程**：
1. 打开搜索页代码，发现只有 `<input>` 和一个空的 `<div id="results">`
2. 没有搜索数据，没有搜索逻辑，纯占位
3. 项目描述里写了「支持全文搜索」，但实际根本没做

**根本原因**：一开始只搭了页面骨架，搜索功能的实现被遗漏了。

**修复方案**：

**第一步：构建时生成搜索索引**

```js
// src/pages/search-index.json.js
import { getCollection } from 'astro:content';

export async function GET() {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  const programs = await getCollection('programs', ({ data }) => !data.draft);

  const index = [
    ...notes.map(entry => ({
      type: 'note',
      title: entry.data.title,
      description: entry.data.description,
      tags: entry.data.tags,
      content: entry.body.replace(/[#*`>\-\[\]_~]/g, ''),
      url: `/notes/${entry.id}/`,
      published: entry.data.published,
    })),
    ...programs.map(entry => ({
      type: 'program',
      title: entry.data.title,
      description: entry.data.description,
      tags: entry.data.tags,
      content: entry.body.replace(/[#*`>\-\[\]_~]/g, ''),
      url: `/programs/${entry.id}/`,
      published: entry.data.published,
    })),
  ];

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

**第二步：前端实现搜索逻辑**

- 输入时 **防抖 150ms**（避免每敲一个字都搜一次）
- 按相关度评分：标题匹配 +10 分、标签匹配 +5 分、描述匹配 +3 分、正文匹配 +1 分
- 结果按分数从高到低排序
- 关键词用 `<mark>` 高亮
- 支持 URL 参数 `?q=关键词` 直接分享搜索结果
- 键盘快捷键：按 `/` 聚焦搜索框，按 `Esc` 清空

**经验教训**：静态站点的搜索不能用后端数据库，常见方案有三种：构建时生成索引前端搜（当前博客用的这种，适合小到中型站点）、Algolia 第三方服务、Pagefind 等专门工具。

### 4. 标签链接被当成纯文本显示

**现象**：文章顶部的标签显示成了 `<a href="/tags/astro">#astro</a>` 这样的原始 HTML 代码，而不是可点击的链接。

**排查过程**：
1. 第一眼以为是 XSS 防护过度，但其他地方的链接都是正常的
2. 检查代码，发现标签是这样写的：
   ```jsx
   {tags.map(tag => `<a href="/tags/${tag}">#${tag}</a>`).join(" ")}
   ```
3. 这是把字符串直接插到 JSX 里了
4. React/Astro 的 JSX 为了安全，默认会把字符串里的 HTML 特殊字符转义，所以 `<` 变成了 `&lt;`，显示出来就是源码

**根本原因**：混淆了「字符串」和「JSX 元素」的概念。JSX 里写字符串，会被当作文本节点渲染，而不是 HTML。

**修复方案**：
```jsx
// ❌ 错误：字符串拼接，会被转义
{tags.map(tag => `<a href="/tags/${tag}">#${tag}</a>`).join(" ")}

// ✅ 正确：返回真实的 JSX 元素
{tags.map(tag => (
  <a href={`/tags/${tag}`}>#{tag}</a>
))}
```

**经验教训**：永远不要在 JSX 里用字符串拼接 HTML。如果真的需要渲染原始 HTML（极少情况），可以用 `set:html` 或 `dangerouslySetInnerHTML`，但要确保内容是可信的。

### 5. `is:inline` 脚本完全没有执行

**现象**：代码块右上角的复制按钮不显示、目录不生成、暗黑模式切换按钮点了没反应。所有 JS 功能全挂了。

**排查过程**：
1. 打开浏览器控制台，没有任何报错
2. 检查 Elements 面板，`<script>` 标签确实存在
3. 点进去看脚本内容，发现脚本被包在花括号和反引号里：
   ```html
   <script is:inline>{
     `console.log('hello')`
   }</script>
   ```
4. 这是一个表达式 `{ `console.log('hello')` }`，Astro 会计算它的值，然后把结果（字符串 `console.log('hello')`）塞进 script 标签里
5. 但问题是：**花括号和反引号本身也被留在了标签里**，所以浏览器解析到的脚本内容是 `{ \n`console.log('hello')`\n }`
6. 这在语法上虽然不是报错（花括号是块作用域，反引号是模板字符串），但模板字符串只是一个表达式，没有赋值也没有调用，等于什么都没做
7. 所以所有函数定义、事件绑定都在模板字符串里，根本不会执行

**根本原因**：写法错误。`is:inline` 脚本里直接写 JS 代码就行，不需要用 Astro 的表达式语法 `{ }`。这个错误比较隐蔽，因为不会报错，只是代码不执行。

**修复方案**：
```astro
<!-- ❌ 错误：用了表达式语法 -->
<script is:inline>{
  `console.log('hello')`
}</script>

<!-- ✅ 正确：直接写 JS -->
<script is:inline>
  console.log('hello')
</script>
```

**经验教训**：Astro 的 `<script>` 默认是模块脚本（会被打包），加 `is:inline` 后变成内联脚本（原样输出）。两种写法里都不需要花括号，花括号只在 HTML 模板部分用来插入动态值。

### 6. 部分文章样式和其他文章不一致

**现象**：改了文章详情页的样式后，大部分文章都更新了，但有两篇（第一篇笔记和个人博客项目）还是旧样式，标签显示成代码、没有复制按钮。

**排查过程**：
1. 以为是缓存，清了缓存刷新还是一样
2. 对比 URL，都是 `/notes/first-note/`，路径没问题
3. 检查文件结构，发现 `src/pages/notes/first-note/index.astro` 这个文件存在
4. 而其他笔记是通过 `src/pages/notes/[...slug].astro` 动态路由渲染的
5. 原来最早的两篇文章是直接写在 `pages/` 目录下的独立页面，后来才改成了内容集合的方式
6. 但旧的页面文件没删掉

**根本原因**：Astro 的路由优先级规则：**文件路由优先于动态路由**。`pages/notes/first-note/index.astro` 会匹配 `/notes/first-note/`，优先级比 `[...slug].astro` 高。所以即使内容集合里也有这篇文章，访问到的还是旧的独立页面。

**修复方案**：删除 `src/pages/notes/first-note/` 和 `src/pages/programs/knowledge-blog/` 这两个旧的独立页面目录，所有文章统一走内容集合 + 动态路由。

**经验教训**：重构时一定要清理旧文件，不要依赖「新路由会覆盖旧路由」。在 Astro 里，静态文件路由的优先级始终高于动态路由。

### 7. 计网笔记的图片全部 404

**现象**：计算机网络第一章笔记里的两张链路示意图（t=0.1s 和 t=0.15s）全部裂图，控制台报 404。

**排查过程**：
1. 检查图片路径：`./imgs/t01s_链路被100bit填满.png`，路径看起来没问题
2. 检查文件系统：图片文件确实在 `imgs/` 文件夹里
3. 检查构建产物 `dist/` 目录：完全找不到图片文件
4. 说明 Astro 根本没有处理这些图片
5. 再看 Markdown 源码，发现图片是这样写的：
   ```html
   <img src="./imgs/t01s_链路被100bit填满.png" alt="..." style="zoom:33%;" />
   ```
6. 是原始 HTML 的 `<img>` 标签，不是 Markdown 的 `![]()` 语法
7. Astro 的图片优化插件只处理 Markdown 语法的图片和 JSX 中的 `Image` 组件，原始 HTML 标签里的相对路径不会被解析和复制

**根本原因**：笔记是从飞书/Word 复制粘贴过来的，图片用的是 HTML `<img>` 标签（还带了飞书自动加的 `zoom:33%` 缩放样式），Astro 不会处理原始 HTML 中的相对图片路径。

**修复方案**：改成标准 Markdown 图片语法：
```markdown
![t=0.1s 链路被100bit填满](./imgs/t01s_链路被100bit填满.png)
```

改完后 Astro 的图片优化插件会自动：
- 复制图片到输出目录
- 优化为 webp 格式（体积更小）
- 生成响应式尺寸
- 自动加上 `width` 和 `height` 属性防止布局偏移

**经验教训**：从外部工具复制内容到 Markdown 时，图片一定要用标准的 `![]()` 语法，不要保留 HTML `<img>` 标签。另外图片文件名最好用英文，避免不同系统的编码问题。

### 8. 文章图片被拉高变形

**现象**：图片能显示了，但比例完全不对——一张横向的示意图（1696×690）被拉成了接近正方形的大高块，画面严重变形。

**排查过程**：
1. 检查图片文件本身：用文件头解析 webp，确认实际尺寸是 1696×690，文件没问题
2. 检查 HTML：`<img>` 标签上有 `width="1696" height="690"` 属性（Astro 自动加的）
3. 检查 CSS：`img { max-width: 100%; }` —— 只限制了最大宽度，没有写 `height`
4. 这就有问题了：浏览器默认会用 `width` 和 `height` 属性来计算图片的固有尺寸
5. 当 `max-width: 100%` 把宽度压缩到 740px（容器宽度）时，高度不会自动按比例缩小
6. 因为 `height` 属性还在，浏览器会用 `height="690"` 作为高度
7. 结果就是宽 740px、高 690px，宽图被硬生生拉高了

**根本原因**：CSS 里只写了 `max-width: 100%`，漏掉了 `height: auto`。有了 `height: auto`，浏览器才会按照宽度变化自动调整高度，保持原始宽高比。

**修复方案**：在全局 CSS 里补充：
```css
img {
  max-width: 100%;
  height: auto;  /* ← 关键，保持宽高比 */
}
```

修复后图片正确显示为 740×302，比例正常。

**经验教训**：只要给图片设置 `max-width: 100%`，就一定要同时设置 `height: auto`。这是响应式图片的标准写法，几乎每个 CSS reset 里都会有。

## 部署

代码推送到 GitHub 后，Cloudflare Pages 会自动构建并部署：

- **构建命令**：`npm run build`
- **输出目录**：`dist`
- **自动部署**：push 到 `main` 分支触发

## 仓库

- GitHub：[github.com/FerrersLEE/lane](https://github.com/FerrersLEE/lane)
- 在线预览：[lane-e01.pages.dev](https://lane-e01.pages.dev)
