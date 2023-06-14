import {
  addServerPlugin,
  createResolver,
  isNuxt3 as isNuxt3Try,
} from '@nuxt/kit'
import defu from 'defu'
import { toHtml } from 'hast-util-to-html'
import { mapValues, pick } from 'lodash-es'
import pProps from 'p-props'
import resolveCwd from 'resolve-cwd'

import revertCompilerChanges from './revert-compiler-changes.js'

const resolver = createResolver(import.meta.url)

export default function (options, nuxt) {
  let isNuxt3 = true
  try {
    isNuxt3 = isNuxt3Try()
  } catch {
    isNuxt3 = false
  }
  nuxt = nuxt || this
  options = defu(
    options,
    nuxt.options.nuxtContentBodyHtml,
    { fields: {} },
  )
  if (!isNuxt3 && Object.keys(options.fields).length === 0) {
    options.fields.bodyHtml = {}
  }
  if (isNuxt3) {
    nuxt.options.runtimeConfig.nuxtContentBodyHtml = options
    nuxt.hook('nitro:config', nitroConfig => {
      if (!nitroConfig.imports) {
        nitroConfig.imports = {
          imports: [],
        }
      }
      nitroConfig.imports.imports.push({
        from: resolver.resolve('./composable.js'),
        name: 'useNuxtContentBodyHtml',
      })
    })
    if (Object.keys(options.fields).length > 0) {
      addServerPlugin(resolver.resolve('./server-plugin.js'))
    }
  } else {
    nuxt.nuxt.hook('content:file:beforeInsert', async file => {
      if (file.extension !== '.md') {
        return
      }

      const Markdown = await import(
        resolveCwd('@nuxt/content/parsers/markdown/index.js')
      )
      Object.assign(
        file,
        await pProps(
          mapValues(options.fields, async fieldConfig => {
            const mergedOptions = (
              await import(resolveCwd('@nuxt/content'))
            ).getOptions({
              markdown: pick(fieldConfig, [
                'remarkPlugins',
                'rehypePlugins',
                'highlighter',
              ]),
            })

            const parser = new Markdown(mergedOptions.markdown)

            return toHtml(
              revertCompilerChanges(await parser.generateBody(file.text)),
            )
          }),
        ),
      )
    })
  }
}
