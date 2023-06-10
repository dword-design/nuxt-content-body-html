import { transformContent } from '@nuxt/content/transformers'
import { toHtml } from 'hast-util-to-html'
import { mapKeys, pick } from 'lodash-es'
import { useRuntimeConfig } from '#imports'
import defu from 'defu'

const runtimeConfig = useRuntimeConfig()

const revertBodyChanges = element => ({
  ...mapKeys(element, (value, key) => {
    switch (key) {
      case 'tag':
        return 'tagName'
      case 'props':
        return 'properties'
      default:
        return key
    }
  }),
  ...(element.children && {
    children: element.children.map(child => revertBodyChanges(child)),
  }),
})

export const useNuxtContentBodyHtml = () => ({
  generate: async (file, options = {}) => {
    options = defu({ highlight: options.highlight, markdown: pick(options, ['remarkPlugins', 'rehypePlugins']) }, runtimeConfig.content)
    return toHtml(revertBodyChanges((await transformContent(file._id, file.body, options)).body))
  },
})
