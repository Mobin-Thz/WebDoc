import type { Block } from 'payload'

export const CodeBlock: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'text',
      options: ['text', 'bash', 'css', 'html', 'javascript', 'json', 'python', 'sql', 'typescript'],
      required: true,
    },
    { name: 'code', type: 'code', required: true },
  ],
}
