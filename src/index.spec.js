import { endent, property } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import axios from 'axios'
import packageName from 'depcheck-package-name'
import { outputFile } from 'fs-extra'
import { Builder, Nuxt } from 'nuxt'
import { URL } from 'url'

export default tester(
  {
    'custom rehype plugin': {
      markdown: '<a href="/bar">Link</a>',
      options: {
        rehypePlugins: [
          [
            packageName`rehype-urls`,
            url => new URL(url.href, 'https://foo.com'),
          ],
        ],
      },
      result: '<p><a href="https://foo.com/bar">Link</a></p>',
    },
    iframe: {
      markdown: '<iframe></iframe>',
      result: '<iframe></iframe>',
    },
    works: {
      markdown: endent`
        # Foo

        Foo bar baz
      `,
      result: endent`
        <h1 id="foo"><a aria-hidden="true" href="#foo" tabindex="-1"><span class="icon icon-link"></span></a>Foo</h1>
        <p>Foo bar baz</p>
      `,
    },
  },
  [
    {
      transform: test => async () => {
        await outputFile('content/home.md', test.markdown)

        const nuxt = new Nuxt({
          createRequire: 'native',
          dev: false,
          modules: ['~/../src', packageName`@nuxt/content`],
          nuxtContentBodyHtml: test.options,
        })
        await new Builder(nuxt).build()
        try {
          await nuxt.listen()

          const result =
            axios.get('http://localhost:3000/_content/home')
            |> await
            |> property('data')
          expect(result.bodyHtml).toEqual(test.result)
        } finally {
          nuxt.close()
        }
      },
    },
    testerPluginTmpDir(),
  ]
)
