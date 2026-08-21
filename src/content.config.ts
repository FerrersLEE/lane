import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
const base = z.object({ title:z.string(), description:z.string(), tags:z.array(z.string()).default([]), published:z.coerce.date(), updated:z.coerce.date().optional(), draft:z.boolean().default(false), securityNote:z.string().optional(), disclosureStatus:z.string().optional() });
const notes = defineCollection({ loader:glob({pattern:"**/*.{md,mdx}",base:"./src/content/notes"}), schema:base });
const programs = defineCollection({ loader:glob({pattern:"**/*.{md,mdx}",base:"./src/content/programs"}), schema:base.extend({status:z.string().optional(),techStack:z.array(z.string()).default([]),repoUrl:z.string().url().optional(),demoUrl:z.string().url().optional()}) });
export const collections={notes,programs};
