import * as markdownOptions from '#mdc-imports';

import generate from './generate.js';

export const useNuxtContentBodyHtml = () => ({
  generate: (file, options = {}) => generate(file, options, markdownOptions),
});
