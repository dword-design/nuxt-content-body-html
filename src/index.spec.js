import { endent, property, replace } from '@dword-design/functions';
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
    async code() {
      await outputFiles({
        'content.config.js': endent`
          import { defineContentConfig, defineCollection, z } from '@nuxt/content';

          export default defineContentConfig({
            collections: {
              content: defineCollection({
                source: '**',
                type: 'page',
                schema: z.object({ bodyHtml: z.string() }),
              }),
            },
          });
        `,
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
            content: { build: { markdown: { highlight: false } } },
          };
        `,
        'server/api/content.get.js': endent`
          import { defineEventHandler, queryCollection } from '#imports';

          export default defineEventHandler(event => queryCollection(event, 'content').select('bodyHtml').first());
        `,
      });

      const nuxt = execaCommand('nuxt dev', {
        env: { NODE_ENV: '' },
        stderr: 'inherit',
      });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/content')
            |> await
            |> property('data.bodyHtml'),
        ).toMatchSnapshot(this);
      } finally {
        await kill(nuxt.pid);
      }
    },
    composable: async () => {
      await outputFiles({
        'content.config.js': endent`
          import { defineContentConfig, defineCollection, z } from '@nuxt/content';

          export default defineContentConfig({
            collections: {
              content: defineCollection({
                source: '**',
                type: 'page',
                schema: z.object({
                  rawbody: z.string(),
                }),
              }),
            },
          });
        `,
        'content/home.md': '[Link](/bar)',
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              'self',
            ],
          }
        `,
        'server/api/content.get.js': endent`
          import { URL } from 'url';

          import { defineEventHandler, queryCollection, useNuxtContentBodyHtml } from '#imports';

          const nuxtContentBodyHtml = useNuxtContentBodyHtml();

          export default defineEventHandler(async event => {
            const file = await queryCollection(event, 'content').first();
            return nuxtContentBodyHtml.generate(file, {
              rehypePlugins: {
                ['${packageName`rehype-urls`}']: { options: url => new URL(url.href, 'https://foo.com') },
              },
            });
          });
        `,
      });

      const nuxt = execaCommand('nuxt dev', {
        env: { NODE_ENV: '' },
        stderr: 'inherit',
      });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/content')
            |> await
            |> property('data'),
        ).toEqual('<p><a href="https://foo.com/bar">Link</a></p>');
      } finally {
        await kill(nuxt.pid);
      }
    },
    async 'disable highlight via module'() {
      await outputFiles({
        'content.config.js': endent`
          import { defineContentConfig, defineCollection, z } from '@nuxt/content';

          export default defineContentConfig({
            collections: {
              content: defineCollection({
                source: '**',
                type: 'page',
                schema: z.object({ bodyHtml: z.string() }),
              }),
            },
          });
        `,
        'content/home.md': endent`
          \`\`\`js
          export default () => {}
          \`\`\`
        `,
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              ['self', { fields: { bodyHtml: { highlight: false } } }],
            ],
          }
        `,
        'server/api/content.get.js': endent`
          import { defineEventHandler, queryCollection } from '#imports';

          export default defineEventHandler(event => queryCollection(event, 'content').select('bodyHtml').first());
        `,
      });

      const nuxt = execaCommand('nuxt dev', {
        env: { NODE_ENV: '' },
        stderr: 'inherit',
      });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/content')
            |> await
            |> property('data.bodyHtml'),
        ).toMatchSnapshot(this);
      } finally {
        await kill(nuxt.pid);
      }
    },
    async highlight() {
      await outputFiles({
        'content.config.js': endent`
          import { defineContentConfig, defineCollection, z } from '@nuxt/content';

          export default defineContentConfig({
            collections: {
              content: defineCollection({
                source: '**',
                type: 'page',
                schema: z.object({ bodyHtml: z.string() }),
              }),
            },
          });
        `,
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
        'server/api/content.get.js': endent`
          import { defineEventHandler, queryCollection } from '#imports';

          export default defineEventHandler(event => queryCollection(event, 'content').select('bodyHtml').first());
        `,
      });

      const nuxt = execaCommand('nuxt dev', {
        env: { NODE_ENV: '' },
        stderr: 'inherit',
      });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/content')
            |> await
            |> property('data.bodyHtml')
            |> replace(/ct-....../g, 'ct-123456'),
        ).toMatchSnapshot(this);
      } finally {
        await kill(nuxt.pid);
      }
    },
    iframe: async () => {
      await outputFiles({
        'content.config.js': endent`
          import { defineContentConfig, defineCollection, z } from '@nuxt/content';

          export default defineContentConfig({
            collections: {
              content: defineCollection({
                source: '**',
                type: 'page',
                schema: z.object({ bodyHtml: z.string() }),
              }),
            },
          });
        `,
        'content/home.md': '<iframe></iframe>',
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              ['self', { fields: { bodyHtml: {} } }],
            ],
          }
        `,
        'server/api/content.get.js': endent`
          import { defineEventHandler, queryCollection } from '#imports';

          export default defineEventHandler(event => queryCollection(event, 'content').select('bodyHtml').first());
        `,
      });

      const nuxt = execaCommand('nuxt dev', {
        env: { NODE_ENV: '' },
        stderr: 'inherit',
      });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/content')
            |> await
            |> property('data.bodyHtml'),
        ).toEqual('<iframe></iframe>');
      } finally {
        await kill(nuxt.pid);
      }
    },
    'inline code': async () => {
      await outputFiles({
        'content.config.js': endent`
          import { defineContentConfig, defineCollection, z } from '@nuxt/content';

          export default defineContentConfig({
            collections: {
              content: defineCollection({
                source: '**',
                type: 'page',
                schema: z.object({ bodyHtml: z.string() }),
              }),
            },
          });
        `,
        'content/home.md': 'foo `bar` baz',
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              ['self', { fields: { bodyHtml: {} } }],
            ],
          }
        `,
        'server/api/content.get.js': endent`
          import { defineEventHandler, queryCollection } from '#imports';

          export default defineEventHandler(event => queryCollection(event, 'content').select('bodyHtml').first());
        `,
      });

      const nuxt = execaCommand('nuxt dev', {
        env: { NODE_ENV: '' },
        stderr: 'inherit',
      });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/content')
            |> await
            |> property('data.bodyHtml'),
        ).toEqual('<p>foo <code class="">bar</code> baz</p>');
      } finally {
        await kill(nuxt.pid);
      }
    },
    'multiple fields': async () => {
      await outputFiles({
        'content.config.js': endent`
          import { defineContentConfig, defineCollection, z } from '@nuxt/content';

          export default defineContentConfig({
            collections: {
              content: defineCollection({
                source: '**',
                type: 'page',
                schema: z.object({ bar: z.string(), foo: z.string() }),
              }),
            },
          });
        `,
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
        'server/api/content.get.js': endent`
          import { defineEventHandler, queryCollection } from '#imports';

          export default defineEventHandler(event => queryCollection(event, 'content').select('bar', 'foo').first());
        `,
      });

      const nuxt = execaCommand('nuxt dev', {
        env: { NODE_ENV: '' },
        stderr: 'inherit',
      });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/content')
            |> await
            |> property('data'),
        ).toEqual({
          bar: '<h1 id="foo">Foo</h1><p>Foo bar baz</p>',
          foo: '<h1 id="foo">Foo</h1><p>Foo bar baz</p>',
        });
      } finally {
        await kill(nuxt.pid);
      }
    },
    async newlines() {
      await outputFiles({
        'content.config.js': endent`
          import { defineContentConfig, defineCollection, z } from '@nuxt/content';

          export default defineContentConfig({
            collections: {
              content: defineCollection({
                source: '**',
                type: 'page',
                schema: z.object({ bodyHtml: z.string() }),
              }),
            },
          });
        `,
        'content/home.md': endent`
          \`\`\`js
          export default () => {
          }
          \`\`\`
        `,
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              ['self', { fields: { bodyHtml: {} } }],
            ],
            content: { build: { markdown: { highlight: false } } },
          };
        `,
        'server/api/content.get.js': endent`
          import { defineEventHandler, queryCollection } from '#imports';

          export default defineEventHandler(event => queryCollection(event, 'content').select('bodyHtml').first());
        `,
      });

      const nuxt = execaCommand('nuxt dev', {
        env: { NODE_ENV: '' },
        stderr: 'inherit',
      });

      try {
        await nuxtDevReady();

        const html =
          axios.get('http://localhost:3000/api/content')
          |> await
          |> property('data.bodyHtml');

        expect(html).toMatchSnapshot(this);
      } finally {
        await kill(nuxt.pid);
      }
    },
    'non-markdown file': async () => {
      await outputFiles({
        'content.config.js': endent`
          import { defineContentConfig, defineCollection, z } from '@nuxt/content';

          export default defineContentConfig({
            collections: {
              content: defineCollection({
                source: '**',
                type: 'page',
                schema: z.object({ bodyHtml: z.string() }),
              }),
            },
          });
        `,
        'content/home.json': '',
        'nuxt.config.js': endent`
          export default {
            modules: [
              '${packageName`@nuxt/content`}',
              ['self', { fields: { bodyHtml: {} } }],
            ],
          }
        `,
        'server/api/content.get.js': endent`
          import { defineEventHandler, queryCollection } from '#imports';

          export default defineEventHandler(event => queryCollection(event, 'content').select('bodyHtml').first());
        `,
      });

      const nuxt = execaCommand('nuxt dev', {
        env: { NODE_ENV: '' },
        stderr: 'inherit',
      });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/content')
            |> await
            |> property('data.bodyHtml'),
        ).toEqual(null);
      } finally {
        await kill(nuxt.pid);
      }
    },
    works: async () => {
      await outputFiles({
        'content.config.js': endent`
          import { defineContentConfig, defineCollection, z } from '@nuxt/content';

          export default defineContentConfig({
            collections: {
              content: defineCollection({
                source: '**',
                type: 'page',
                schema: z.object({ bodyHtml: z.string() }),
              }),
            },
          });
        `,
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
        'server/api/content.get.js': endent`
          import { defineEventHandler, queryCollection } from '#imports';

          export default defineEventHandler(event => queryCollection(event, 'content').select('bodyHtml').first());
        `,
      });

      const nuxt = execaCommand('nuxt dev', {
        env: { NODE_ENV: '' },
        stderr: 'inherit',
      });

      try {
        await nuxtDevReady();

        expect(
          axios.get('http://localhost:3000/api/content')
            |> await
            |> property('data.bodyHtml'),
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
