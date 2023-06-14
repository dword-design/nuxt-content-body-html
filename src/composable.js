import { transformContent } from '@nuxt/content/transformers'
import defu from 'defu'
import { toHtml } from 'hast-util-to-html'
import { pick } from 'lodash-es'

import { useRuntimeConfig } from '#imports'

import revertCompilerChanges from './revert-compiler-changes.js'

const runtimeConfig = useRuntimeConfig()

export const useNuxtContentBodyHtml = () => ({
  generate: async (file, options = {}) => {
    options = defu(
      {
        highlight: options.highlight,
        markdown: pick(options, ['remarkPlugins', 'rehypePlugins']),
      },
      runtimeConfig.content,
    )

    return toHtml(
      revertCompilerChanges(
        (await transformContent(file._id, file.body, options)).body,
      ),
    )
  },
})
