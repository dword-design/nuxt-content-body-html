import { fromPairs, keys, map, reduce } from '@dword-design/functions'
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
  let stream
  this.nuxt.hook('content:options', contentOptions => {
    const plugins = [
      { instance: remarkParse },
      ...contentOptions.markdown.remarkPlugins,
      ...options.remarkPlugins,
      { instance: remarkRehype, options: { allowDangerousHtml: true } },
      ...contentOptions.markdown.rehypePlugins,
      ...options.rehypePlugins,
      { instance: rehypeStringify },
    ]
    stream =
      plugins
      |> reduce(
        (acc, plugin) => acc.use(plugin.instance, plugin.options),
        unified()
      )
  })
  this.nuxt.hook('content:file:beforeInsert', async file => {
    file[options.fieldName] = await new Promise((resolve, reject) =>
      stream.process(file.text, (error, result) =>
        error ? reject(error) : resolve(result.contents)
      )
    )
  })
}
