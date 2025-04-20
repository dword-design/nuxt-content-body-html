import { parseMarkdown } from '@nuxtjs/mdc/runtime';
import defu from 'defu';
import { toHtml } from 'hast-util-to-html';
import { omit } from 'lodash-es';

import revertCompilerChanges from './revert-compiler-changes.js';

export default async (file, options = {}, markdownOptions = {}) => {
  options = defu(options, markdownOptions);

  /**
   * When we disable highlight via the module, it was already enabled before and the highlight plugin was added.
   * So we need to remove it again.
   */
  if (options.highlight === false) {
    options.rehypePlugins = omit(options.rehypePlugins, ['highlight']);
  }

  const parsed = await parseMarkdown(file.rawbody || file.body, {
    ...options,
    rehype: { plugins: options.rehypePlugins },
    remark: { plugins: options.remarkPlugins },
  });

  const body = { ...parsed.body, toc: parsed.toc };
  return toHtml(revertCompilerChanges(body));
};
