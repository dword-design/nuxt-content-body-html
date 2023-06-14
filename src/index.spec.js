import { endent, first, pick, property, replace } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import axios from 'axios'
import packageName from 'depcheck-package-name'
import { execa, execaCommand } from 'execa'
import fs from 'fs-extra'
import nuxtDevReady from 'nuxt-dev-ready'
import ora from 'ora'
import outputFiles from 'output-files'
import P from 'path'
import kill from 'tree-kill-promise'

export default tester(
  {
    composable: async () => {
      await outputFiles({
        'content/home.md': '<a href="/bar">Link</a>',
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              'self',
            ],
          }
        `,
        'server/plugins/body-html.js': endent`
          import { defineNitroPlugin, useNuxtContentBodyHtml } from '#imports'
          import { URL } from 'url'

          const nuxtContentBodyHtml = useNuxtContentBodyHtml()

          export default defineNitroPlugin(nitroApp => {
            const bodyHtmls = {}

            nitroApp.hooks.hook('content:file:beforeParse', async file =>
              bodyHtmls[file._id] = await nuxtContentBodyHtml.generate(file, {
                rehypePlugins: {
                  ['${packageName`rehype-urls`}']: { transform: url => new URL(url.href, 'https://foo.com') },
                },
              })
            )
            nitroApp.hooks.hook('content:file:afterParse', file => (file.bodyHtml = bodyHtmls[file._id]))
          })
        `,
      })

      const nuxt = execaCommand('nuxt dev')
      try {
        await nuxtDevReady()
        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toEqual('<p><a href="https://foo.com/bar">Link</a></p>')
      } finally {
        await kill(nuxt.pid)
      }
    },
    'disable highlight after enable': async () => {
      await outputFiles({
        'content/home.md': endent`
          \`\`\`js
          export default () => {}
          \`\`\`
        `,
        'nuxt.config.js': endent`
          export default {
            modules: [
              ['${packageName`@nuxt/content`}', { highlight: true }],
              ['self', { fields: { bodyHtml: { highlight: false } } }],
            ],
          }
        `,
      })

      const nuxt = execaCommand('nuxt dev')
      try {
        await nuxtDevReady()
        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toEqual(endent`
          <code class="language-js" code="export default () => {}
          " language="js" meta=""><pre><code __ignoreMap="">export default () => {}
          </code></pre></code>
        `)
      } finally {
        await kill(nuxt.pid)
      }
    },
    async highlight() {
      await outputFiles({
        'content/home.md': endent`
          \`\`\`js
          export default () => {}
          \`\`\`
        `,
        'nuxt.config.js': endent`
          export default {
            modules: [
              ['${packageName`@nuxt/content`}', { highlight: true }],
              ['self', { fields: { bodyHtml: {} } }],
            ],
          }
        `,
      })

      const nuxt = execaCommand('nuxt dev')
      try {
        await nuxtDevReady()
        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml')
            |> replace(/ct-....../g, 'ct-123456'),
        ).toMatchSnapshot(this)
      } finally {
        await kill(nuxt.pid)
      }
    },
    iframe: async () => {
      await outputFiles({
        'content/home.md': '<iframe></iframe>',
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              ['self', { fields: { bodyHtml: {} } }],
            ],
          }
        `,
      })

      const nuxt = execaCommand('nuxt dev')
      try {
        await nuxtDevReady()
        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toEqual('<iframe></iframe>')
      } finally {
        await kill(nuxt.pid)
      }
    },
    'multiple fields': async () => {
      await outputFiles({
        'content/home.md': endent`
          # Foo

          Foo bar baz
        `,
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              ['self', { fields: { foo: {}, bar: {} } }],
            ],
          }
        `,
      })

      const nuxt = execaCommand('nuxt dev')
      try {
        await nuxtDevReady()
        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> pick(['foo', 'bar']),
        ).toEqual({
          bar: '<h1 id="foo">Foo</h1><p>Foo bar baz</p>',
          foo: '<h1 id="foo">Foo</h1><p>Foo bar baz</p>',
        })
      } finally {
        await kill(nuxt.pid)
      }
    },
    'non-markdown file': async () => {
      await outputFiles({
        'content/home.json': '',
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              ['self', { fields: { bodyHtml: {} } }],
            ],
          }
        `,
      })

      const nuxt = execaCommand('nuxt dev')
      try {
        await nuxtDevReady()
        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toBeUndefined()
      } finally {
        await kill(nuxt.pid)
      }
    },
    nuxt2: async () => {
      await outputFiles({
        'content/home.md': endent`
          # Foo

          Foo bar baz
        `,
        'nuxt.config.js': endent`
          export default {
            modules: [
              '~/../src/index.js',
              '${packageName`@nuxt/content`}',
            ],
          }
        `,
      })
      await fs.remove('node_modules')
      await fs.symlink(
        P.join('..', 'node_modules', '.cache', 'nuxt2', 'node_modules'),
        'node_modules',
      )

      const nuxt = execa(P.join('node_modules', '.bin', 'nuxt'), ['dev'])
      try {
        await nuxtDevReady()
        expect(
          axios.get('http://localhost:3000/_content/home')
            |> await
            |> property('data')
            |> property('bodyHtml'),
        ).toEqual(endent`
          <h1 id="foo"><a aria-hidden="true" href="#foo" tabindex="-1"><span class="icon icon-link"></span></a>Foo</h1>
          <p>Foo bar baz</p>
        `)
      } finally {
        await kill(nuxt.pid)
      }
    },
    'nuxt2: code': async () => {
      await outputFiles({
        'content/home.md': endent`
          \`\`\`js
          export default () => {}
          \`\`\`
        `,
        'nuxt.config.js': endent`
          export default {
            modules: [
              '~/../src/index.js',
              '${packageName`@nuxt/content`}',
            ],
          }
        `,
      })
      await fs.remove('node_modules')
      await fs.symlink(
        P.join('..', 'node_modules', '.cache', 'nuxt2', 'node_modules'),
        'node_modules',
      )

      const nuxt = execa(P.join('node_modules', '.bin', 'nuxt'), ['dev'])
      try {
        await nuxtDevReady()
        expect(
          axios.get('http://localhost:3000/_content/home')
            |> await
            |> property('data')
            |> property('bodyHtml'),
        ).toEqual(endent`
          <div class="nuxt-content-highlight"><pre class="language-js line-numbers"><code><span class="token keyword module">export</span> <span class="token keyword module">default</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=></span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
          </code></pre></div>
        `)
      } finally {
        await kill(nuxt.pid)
      }
    },
    'nuxt2: disable highlighter': async () => {
      await outputFiles({
        'content/home.md': endent`
          \`\`\`js
          export default () => {}
          \`\`\`
        `,
        'nuxt.config.js': endent`
          export default {
            modules: [
              ['~/../src/index.js', {
                fields: {
                  bodyHtml: { highlighter: code => \`<pre><code class="language-js">\${code}</code></pre>\` },
                },
              }],
              '${packageName`@nuxt/content`}',
            ],
          }
        `,
      })
      await fs.remove('node_modules')
      await fs.symlink(
        P.join('..', 'node_modules', '.cache', 'nuxt2', 'node_modules'),
        'node_modules',
      )

      const nuxt = execa(P.join('node_modules', '.bin', 'nuxt'), ['dev'])
      try {
        await nuxtDevReady()
        expect(
          axios.get('http://localhost:3000/_content/home')
            |> await
            |> property('data')
            |> property('bodyHtml'),
        ).toEqual(endent`
          <div class="nuxt-content-highlight"><pre><code class="language-js">export default () => {}
          </code></pre></div>
        `)
      } finally {
        await kill(nuxt.pid)
      }
    },
    'nuxt2: relative link': async () => {
      await outputFiles({
        'content/home.md': endent`
          [relative link](/foo)
        `,
        'nuxt.config.js': endent`
          export default {
            modules: [
              '~/../src/index.js',
              '${packageName`@nuxt/content`}',
            ],
          }
        `,
      })
      await fs.remove('node_modules')
      await fs.symlink(
        P.join('..', 'node_modules', '.cache', 'nuxt2', 'node_modules'),
        'node_modules',
      )

      const nuxt = execa(P.join('node_modules', '.bin', 'nuxt'), ['dev'])
      try {
        await nuxtDevReady()
        expect(
          axios.get('http://localhost:3000/_content/home')
            |> await
            |> property('data')
            |> property('bodyHtml'),
        ).toEqual('<p><a href="/foo">relative link</a></p>')
      } finally {
        await kill(nuxt.pid)
      }
    },
    works: async () => {
      await outputFiles({
        'content/home.md': endent`
          # Foo

          Foo bar baz
        `,
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              ['self', { fields: { bodyHtml: {} } }],
            ],
          }
        `,
      })

      const nuxt = execaCommand('nuxt dev')
      try {
        await nuxtDevReady()
        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toEqual('<h1 id="foo">Foo</h1><p>Foo bar baz</p>')
      } finally {
        await kill(nuxt.pid)
      }
    },
  },
  [
    testerPluginTmpDir(),
    {
      before: async () => {
        const spinner = ora('Installing Nuxt 2 and @nuxt/content 1').start()
        await fs.outputFile(
          P.join('node_modules', '.cache', 'nuxt2', 'package.json'),
          JSON.stringify({}),
        )
        await execaCommand('yarn add nuxt@^2 @nuxt/content@^1', {
          cwd: P.join('node_modules', '.cache', 'nuxt2'),
        })
        spinner.stop()
      },
    },
    {
      beforeEach: async () => {
        await fs.outputFile(
          'node_modules/self/package.json',
          JSON.stringify({ exports: './src/index.js', name: 'self' }),
        )
        await fs.copy('../src', 'node_modules/self/src')
      },
    },
  ],
)
