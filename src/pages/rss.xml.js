import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const notes = (await getCollection('notes', ({ data }) => !data.draft))
    .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());

  const programs = (await getCollection('programs', ({ data }) => !data.draft))
    .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());

  const items = [
    ...notes.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.published,
      link: `/notes/${entry.id}/`,
      categories: entry.data.tags,
    })),
    ...programs.map((entry) => ({
      title: `[项目] ${entry.data.title}`,
      description: entry.data.description,
      pubDate: entry.data.published,
      link: `/programs/${entry.id}/`,
      categories: entry.data.tags,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'Lane · 学习与安全研究',
    description: '学习笔记、项目实践与安全研究。',
    site: context.site,
    items,
    customData: `<language>zh-CN</language>`,
  });
}
