import { getCollection } from 'astro:content';

export async function GET() {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  const programs = await getCollection('programs', ({ data }) => !data.draft);

  const cleanBody = (body: string) =>
    body.replace(/[#*`>\-\[\]]/g, '').replace(/\s+/g, ' ').trim();

  const index = [
    ...notes.map((entry) => ({
      type: 'note' as const,
      slug: entry.id,
      title: entry.data.title,
      description: entry.data.description,
      tags: entry.data.tags,
      content: cleanBody(entry.body ?? ''),
      url: `/notes/${entry.id}/`,
      published: entry.data.published.toISOString(),
    })),
    ...programs.map((entry) => ({
      type: 'program' as const,
      slug: entry.id,
      title: entry.data.title,
      description: entry.data.description,
      tags: entry.data.tags,
      content: cleanBody(entry.body ?? ''),
      url: `/programs/${entry.id}/`,
      published: entry.data.published.toISOString(),
    })),
  ];

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
