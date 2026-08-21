import rss from '@astrojs/rss';
export const GET = (context) => rss({title:'你的名字 · 学习与安全研究',description:'学习笔记、项目实践与安全研究。',site:context.site ?? 'https://example.pages.dev',items:[{title:'第一篇学习笔记',description:'用于验证 Markdown、代码高亮和文章页面渲染。',pubDate:new Date('2026-08-21'),link:'/notes/first-note/'}]});
