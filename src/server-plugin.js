import { mapValues } from 'lodash-es'
import pProps from 'p-props'

import { defineNitroPlugin, useRuntimeConfig, useNuxtContentBodyHtml } from '#imports'
//import { useNuxtContentBodyHtml } from '#content-body-html'

const nuxtContentBodyHtml = useNuxtContentBodyHtml()

const runtimeConfig = useRuntimeConfig()

const options = runtimeConfig.nuxtContentBodyHtml

export default defineNitroPlugin(nitroApp => {
  const bodyHtmls = {}
  nitroApp.hooks.hook('content:file:beforeParse', async file => {
    if (!file._id.endsWith('.md')) {
      return
    }
    bodyHtmls[file._id] = await pProps(
      mapValues(options.fields, fieldConfig =>
        nuxtContentBodyHtml.generate(file, fieldConfig),
      ),
    )
  })
  nitroApp.hooks.hook('content:file:afterParse', file => {
    if (!file._id.endsWith('.md')) {
      return
    }
    Object.assign(file, bodyHtmls[file._id])
  })
})
