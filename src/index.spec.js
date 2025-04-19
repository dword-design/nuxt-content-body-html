import {
  endent,
  first,
  pick,
  property,
  replace,
} from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import axios from 'axios';
import packageName from 'depcheck-package-name';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import nuxtDevReady from 'nuxt-dev-ready';
import outputFiles from 'output-files';
import kill from 'tree-kill-promise';

export default tester(
  {
    code: async () => {
      await outputFiles({
        'content/home.md': endent`
          \`\`\`js
          export default () => {}
          \`\`\`
        `,
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              ['self', { fields: { bodyHtml: {} } }],
            ],
          }
        `,
      });

      const nuxt = execaCommand('nuxt dev', { env: { NODE_ENV: '' } });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toEqual(endent`
          <pre><code __ignoreMap="">export default () => {}
          </code></pre>
        `);
      } finally {
        await kill(nuxt.pid);
      }
    },
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
      });

      const nuxt = execaCommand('nuxt dev', { env: { NODE_ENV: '' } });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toEqual('<p><a href="https://foo.com/bar">Link</a></p>');
      } finally {
        await kill(nuxt.pid);
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
      });

      const nuxt = execaCommand('nuxt dev', {
        env: { NODE_ENV: '' },
      });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toEqual(endent`
          <pre><code __ignoreMap="">export default () => {}
          </code></pre>
        `);
      } finally {
        await kill(nuxt.pid);
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
      });

      const nuxt = execaCommand('nuxt dev', { env: { NODE_ENV: '' } });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml')
            |> replace(/ct-....../g, 'ct-123456'),
        ).toMatchSnapshot(this);
      } finally {
        await kill(nuxt.pid);
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
      });

      const nuxt = execaCommand('nuxt dev', { env: { NODE_ENV: '' } });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toEqual('<iframe></iframe>');
      } finally {
        await kill(nuxt.pid);
      }
    },
    'inline code': async () => {
      await outputFiles({
        'content/home.md': 'foo `bar` baz',
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              ['self', { fields: { bodyHtml: {} } }],
            ],
          }
        `,
      });

      const nuxt = execaCommand('nuxt dev', { env: { NODE_ENV: '' } });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toEqual('<p>foo <code>bar</code> baz</p>');
      } finally {
        await kill(nuxt.pid);
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
      });

      const nuxt = execaCommand('nuxt dev', { env: { NODE_ENV: '' } });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> pick(['foo', 'bar']),
        ).toEqual({
          bar: '<h1 id="foo">Foo</h1><p>Foo bar baz</p>',
          foo: '<h1 id="foo">Foo</h1><p>Foo bar baz</p>',
        });
      } finally {
        await kill(nuxt.pid);
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
      });

      const nuxt = execaCommand('nuxt dev', { env: { NODE_ENV: '' } });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toBeUndefined();
      } finally {
        await kill(nuxt.pid);
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
      });

      const nuxt = execaCommand('nuxt dev', { env: { NODE_ENV: '' } });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/_content/query?_path=/home')
            |> await
            |> property('data')
            |> first
            |> property('bodyHtml'),
        ).toEqual('<h1 id="foo">Foo</h1><p>Foo bar baz</p>');
      } finally {
        await kill(nuxt.pid);
      }
    },
  },
  [
    testerPluginTmpDir(),
    {
      beforeEach: async () => {
        await fs.outputFile(
          'node_modules/self/package.json',
          JSON.stringify({
            exports: './src/index.js',
            name: 'self',
            type: 'module',
          }),
        );

        await fs.copy('../src', 'node_modules/self/src');
      },
    },
  ],
);
