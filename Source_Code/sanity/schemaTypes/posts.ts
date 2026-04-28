import { defineField, defineType } from "sanity";

export const Posts = defineType({
    name: 'posts',
    title: 'Post',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            type: 'string',
        }),
        defineField({
            name: 'slug',
            type: 'slug',
            options: {
                source: 'title',
            },
        }),
        defineField({
            name: 'author',
            type: 'reference',
            to: { type: 'author' },
        }),
        defineField({
            name: 'views',
            type: 'number',
        }),
        defineField({
            name: 'description',
            type: 'text',
        }),
        defineField({
            name: 'category',
            type: 'string',
            validation: (Rule) =>
                Rule.min(1).max(20).required().error("Please enter a category"),
        }),
        defineField({
            name: 'image',
            type: 'url',
            validation: (Rule) => Rule.required(),
        }),
        // Kept for backwards compatibility with already-published documents.
        // New posts populate `repoUrl` (GitHub) and/or `liveUrl` (deployment).
        defineField({
            name: 'projectLink',
            type: 'url',
            title: 'Project Link / Repo URL (legacy)',
        }),
        defineField({
            name: 'repoUrl',
            type: 'url',
            title: 'GitHub Repository URL',
            description:
                'Used to render the README on the post page. Should be a https://github.com/<owner>/<repo> URL.',
        }),
        defineField({
            name: 'liveUrl',
            type: 'url',
            title: 'Live URL (Vercel deployment, etc.)',
            description:
                'Optional deployed URL. Rendered as an inline preview on the post page.',
        }),
        defineField({
            name: 'body',
            type: 'markdown',
            title: 'Body / Notes',
            description:
                'Optional markdown notes. If empty, the post page falls back to the linked GitHub README.',
        }),
    ],
})
