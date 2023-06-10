import {
  addServerPlugin,
  createResolver,
  isNuxt3 as isNuxt3Try,
} from '@nuxt/kit'
import defu from 'defu'

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
    ...[
      options,
      nuxt.options.nuxtContentBodyHtml,
      ...(isNuxt3 ? [nuxt.options.runtimeConfig.nuxtContentBodyHtml] : []),
      { ...(isNuxt3 && { fieldName: 'bodyHtml' }), fields: {} },
    ],
  )
  if (Array.isArray(options.fields)) {
    options.fields = Object.fromEntries(
      options.fields.map(field => [field, {}]),
    )
  }
  if (options.fieldName) {
    options.fields[options.fieldName] = {}
  }
  if (isNuxt3 && Object.keys(options.fields).length > 0) {
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
    addServerPlugin(resolver.resolve('./server-plugin.js'))
  }
}
