import { createResolver } from '@nuxt/kit';
import defu from 'defu';
import { mapValues } from 'lodash-es';
import pProps from 'p-props';

import generate from './generate.js';

const resolver = createResolver(import.meta.url);

export default (options, nuxt) => {
  options = defu(options, nuxt.options.nuxtContentBodyHtml, { fields: {} });

  nuxt.hook('nitro:config', nitroConfig => {
    if (!nitroConfig.imports) {
      nitroConfig.imports = { imports: [] };
    }

    nitroConfig.imports.imports.push({
      from: resolver.resolve('./composable.js'),
      name: 'useNuxtContentBodyHtml',
    });
  });

  if (Object.keys(options.fields).length > 0) {
    let markdownOptions;

    nuxt.hook(
      'content:file:beforeParse',
      ({ parserOptions }) =>
        (markdownOptions = {
          ...parserOptions.markdown,
          /**
           * parserOptions passed to the context resets the highlighter, but we do not want that.
           * https://github.com/nuxt/content/blob/1f66e8b35b8f3810ab95a3a1ddb692de8b2c77a3/src/utils/content/index.ts#L149
           */
          highlight: nuxt.options.mdc.highlight,
        }),
    );

    nuxt.hook('content:file:afterParse', async ({ file, content }) => {
      if (file.extension !== '.md') {
        return;
      }

      Object.assign(
        content,
        await pProps(
          mapValues(options.fields, fieldConfig =>
            generate(file, fieldConfig, markdownOptions),
          ),
        ),
      );
    });
  }
};
