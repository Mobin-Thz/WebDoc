import {
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { CalloutBlock } from './blocks/Callout'
import { CodeBlock } from './blocks/Code'
import { YouTubeBlock } from './blocks/YouTube'

export const lessonEditor = lexicalEditor({
  features: [
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BoldFeature(),
    ItalicFeature(),
    InlineCodeFeature(),
    OrderedListFeature(),
    UnorderedListFeature(),
    BlockquoteFeature(),
    LinkFeature({ enabledCollections: ['subjects', 'chapters', 'lessons'] }),
    UploadFeature({ enabledCollections: ['media'] }),
    BlocksFeature({ blocks: [CodeBlock, YouTubeBlock, CalloutBlock] }),
  ],
})
