import { parseMarkdown } from '@nuxtjs/mdc/runtime';
import defu from 'defu';
import { toHtml } from 'hast-util-to-html';
import { omit } from 'lodash-es';

import revertCompilerChanges from './revert-compiler-changes.js';

const importPlugins = async (plugins = {}) => {
  const resolvedPlugins = {};

  for (const [name, plugin] of Object.entries(plugins)) {
    if (plugin) {
      resolvedPlugins[name] = {
        instance:
          plugin.instance ||
          (await import(
            /* @vite-ignore */
            name
          ).then(m => m.default || m)),
        options: plugin.options || {},
      };
    } else {
      resolvedPlugins[name] = false;
    }
  }

  return resolvedPlugins;
};

export default async (file, options = {}, markdownOptions = {}) => {
  options = defu(options, markdownOptions);

  if (options.highlight === false) {
    options.rehypePlugins = omit(options.rehypePlugins, ['highlight']);
  }

  options.rehypePlugins = await importPlugins(options.rehypePlugins);
  options.remarkPlugins = await importPlugins(options.remarkPlugins);

  const parsed = await parseMarkdown(file.rawbody || file.body, {
    ...options,
    rehype: {
      plugins: options.rehypePlugins,
      // options: { handlers: { link } }
    },
    remark: { plugins: options.remarkPlugins },
  });

  const body = { ...parsed.body, toc: parsed.toc };
  return toHtml(revertCompilerChanges(body));
};
