import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {authorType} from './authorType'
import { Posts } from './posts'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, categoryType, authorType, Posts],
}
