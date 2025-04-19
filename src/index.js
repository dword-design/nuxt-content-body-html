import { addServerPlugin, createResolver } from '@nuxt/kit';
import defu from 'defu';

const resolver = createResolver(import.meta.url);

export default (options, nuxt) => {
  options = defu(options, nuxt.options.nuxtContentBodyHtml, { fields: {} });
  nuxt.options.runtimeConfig.nuxtContentBodyHtml = options;

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
    addServerPlugin(resolver.resolve('./server-plugin.js'));
  }
};
