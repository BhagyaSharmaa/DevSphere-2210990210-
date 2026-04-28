import {UserIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'githubLogin',
      },
    }),
    defineField({
      name: 'githubLogin',
      type: 'string',
      title: 'GitHub Login',
    }),
    defineField({
      name: 'githubId',
      type: 'string',
      title: 'GitHub ID',
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'reposSyncedAt',
      type: 'datetime',
      title: 'Repos Synced At',
    }),
    defineField({
      name: 'repositories',
      title: 'Public GitHub Repositories',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'githubRepository',
          fields: [
            defineField({name: 'name', title: 'Name', type: 'string'}),
            defineField({
              name: 'fullName',
              title: 'Full Name',
              type: 'string',
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
            }),
            defineField({
              name: 'language',
              title: 'Language',
              type: 'string',
            }),
            defineField({
              name: 'stars',
              title: 'Stars',
              type: 'number',
            }),
            defineField({
              name: 'forks',
              title: 'Forks',
              type: 'number',
            }),
            defineField({
              name: 'updatedAt',
              title: 'Updated At',
              type: 'datetime',
            }),
            defineField({
              name: 'ownerLogin',
              title: 'Owner Login',
              type: 'string',
              description:
                'GitHub login of the repo owner (may differ from this author when affiliation is collaborator/organization_member).',
            }),
            defineField({
              name: 'affiliation',
              title: 'Affiliation',
              type: 'string',
              options: {
                list: [
                  { title: 'Owner', value: 'owner' },
                  { title: 'Collaborator', value: 'collaborator' },
                  { title: 'Organization member', value: 'organization_member' },
                ],
              },
            }),
            defineField({
              name: 'codespaceUrl',
              title: 'Codespace web_url (most recent)',
              type: 'url',
              description:
                'Cached at sign-in from GitHub /user/codespaces. Empty if the user has no codespace for this repo.',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'bio',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
})
