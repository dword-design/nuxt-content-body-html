import { fromPairs, keys, map, pick, reduce } from '@dword-design/functions'
import handlers from '@nuxt/content/parsers/markdown/handlers'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import unified from 'unified'

export default function (options) {
  options = {
    fieldName: 'bodyHtml',
    rehypePlugins: [],
    remarkPlugins: [],
    ...this.options.nuxtContentBodyHtml,
    ...options,
  }
  options = {
    ...options,
    ...({ rehype: true, remark: true }
      |> keys
      |> map(type => [
        `${type}Plugins`,
        options[`${type}Plugins`]
          |> map(plugin => ({
            instance: Array.isArray(plugin) ? plugin[0] : plugin,
            options: Array.isArray(plugin) ? plugin[1] : [],
          }))
          |> map(plugin => ({
            ...plugin,
            instance:
              typeof plugin.instance === 'string'
                ? require(plugin.instance)
                : plugin.instance,
          })),
      ])
      |> fromPairs),
  }
  this.nuxt.hook(
    'content:options',
    contentOptions =>
      (options = {
        ...(contentOptions |> pick(['highlighter'])),
        ...options,
        rehypePlugins: [
          ...contentOptions.markdown.rehypePlugins,
          ...(options.rehypePlugins || []),
        ],
        remarkPlugins: [
          ...contentOptions.markdown.remarkPlugins,
          ...(options.remarkPlugins || []),
        ],
      })
  )
  let stream
  this.nuxt.hook('content:file:beforeInsert', async file => {
    if (file.extension === '.md') {
      if (stream === undefined) {
        if (
          typeof options.highlighter === 'function' &&
          options.highlighter.length === 0
        ) {
          options.highlighter = await options.highlighter()
        }

        const myHandlers = handlers(options.highlighter)
        if ('highlighter' in options && !options.highlighter) {
          delete myHandlers.code
        }

        const plugins = [
          { instance: remarkParse },
          ...options.remarkPlugins,
          {
            instance: remarkRehype,
            options: {
              allowDangerousHtml: true,
              handlers: myHandlers,
            },
          },
          ...options.rehypePlugins,
          { instance: rehypeStringify },
        ]
        stream =
          plugins
          |> reduce(
            (acc, plugin) => acc.use(plugin.instance, plugin.options),
            unified()
          )
      }
      file[options.fieldName] = await new Promise((resolve, reject) =>
        stream.process(file.text, (error, result) =>
          error ? reject(error) : resolve(result.contents)
        )
      )
    }
  })
}
