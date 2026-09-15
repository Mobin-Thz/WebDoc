import type { Block } from 'payload'

export const CalloutBlock: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  fields: [
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'info',
      options: ['info', 'warning', 'tip'],
      required: true,
    },
    { name: 'text', type: 'textarea', required: true },
  ],
  jsx: {
    export: ({ fields }) => ({ children: String(fields.text ?? ''), props: { kind: fields.kind ?? 'info' } }),
    import: ({ children, props }) => {
      const kind = props.kind
      if (!['info', 'warning', 'tip'].includes(String(kind))) return false
      return { kind, text: children.trim() }
    },
  },
}
