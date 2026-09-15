import type { Block } from 'payload'

const languages = ['text', 'bash', 'css', 'html', 'javascript', 'json', 'python', 'sql', 'typescript']

export const CodeBlock: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'text',
      options: languages,
      required: true,
    },
    { name: 'code', type: 'code', required: true },
  ],
  jsx: {
    customEndRegex: { optional: true, regExp: /^[ \t]*`{3,}[ \t]*$/ },
    customStartRegex: /^[ \t]*(`{3,})([\w-]+)?[ \t]*$/,
    doNotTrimChildren: true,
    export: ({ fields }) => {
      const code = typeof fields.code === 'string' ? fields.code : ''
      const longestFence = Math.max(2, ...(code.match(/`+/g) ?? []).map((fence) => fence.length))
      const fence = '`'.repeat(longestFence + 1)
      return `${fence}${fields.language ?? 'text'}\n${code}\n${fence}`
    },
    import: ({ children, openMatch }) => {
      const language = openMatch?.[2] || 'text'
      if (!languages.includes(language)) return false
      return { code: children.replace(/^\n|\n$/g, ''), language }
    },
  },
}
