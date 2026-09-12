import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores(['.next/**', 'media/**', 'src/migrations/**', 'src/payload-types.ts', 'src/app/(payload)/admin/importMap.js']),
])
