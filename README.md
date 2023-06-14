<!-- TITLE/ -->
# nuxt-content-body-html
<!-- /TITLE -->

<!-- BADGES/ -->
  <p>
    <a href="https://npmjs.org/package/nuxt-content-body-html">
      <img
        src="https://img.shields.io/npm/v/nuxt-content-body-html.svg"
        alt="npm version"
      >
    </a><img src="https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue" alt="Linux macOS Windows compatible"><a href="https://github.com/dword-design/nuxt-content-body-html/actions">
      <img
        src="https://github.com/dword-design/nuxt-content-body-html/workflows/build/badge.svg"
        alt="Build status"
      >
    </a><a href="https://codecov.io/gh/dword-design/nuxt-content-body-html">
      <img
        src="https://codecov.io/gh/dword-design/nuxt-content-body-html/branch/master/graph/badge.svg"
        alt="Coverage status"
      >
    </a><a href="https://david-dm.org/dword-design/nuxt-content-body-html">
      <img src="https://img.shields.io/david/dword-design/nuxt-content-body-html" alt="Dependency status">
    </a><img src="https://img.shields.io/badge/renovate-enabled-brightgreen" alt="Renovate enabled"><br/><a href="https://gitpod.io/#https://github.com/dword-design/nuxt-content-body-html">
      <img
        src="https://gitpod.io/button/open-in-gitpod.svg"
        alt="Open in Gitpod"
        width="114"
      >
    </a><a href="https://www.buymeacoffee.com/dword">
      <img
        src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
        alt="Buy Me a Coffee"
        width="114"
      >
    </a><a href="https://paypal.me/SebastianLandwehr">
      <img
        src="https://sebastianlandwehr.com/images/paypal.svg"
        alt="PayPal"
        width="163"
      >
    </a><a href="https://www.patreon.com/dworddesign">
      <img
        src="https://sebastianlandwehr.com/images/patreon.svg"
        alt="Patreon"
        width="163"
      >
    </a>
</p>
<!-- /BADGES -->

<!-- DESCRIPTION/ -->
Adds a property to each @nuxt/content document containing the raw HTML body, rendered from markdown.
<!-- /DESCRIPTION -->

<!-- INSTALL/ -->
## Install

```bash
# npm
$ npm install nuxt-content-body-html

# Yarn
$ yarn add nuxt-content-body-html
```
<!-- /INSTALL -->

Sometimes you need the raw HTML code of `@nuxt/content` documents for processing. A frequent use case is to generate an RSS feed and to add the HTML as `content:encoded`. The module will use the default remark and rehype plugins. You can also add additional plugins.

## Nuxt 3

Add the module to your `nuxt.config.js` file:

```js
export default {
  modules: [
    '@nuxt/content',
    'nuxt-content-body-html',
  },
}
```

To generate the HTML, you have two options: 1. Add fields to the module config and 2. use the `useNuxtContentBodyHtml` composable. If you just need a simple HTML version of your markdown content, the module config is fine. But if you want to add extra remark or rehype plugins involving functions, you will need to use the composable because Nuxt won't be able to serialize it into the runtime config.

### Module config

```js
export default {
  modules: [
    '@nuxt/content',
    ['nuxt-content-body-html', {
      fields: {
        bodyHtml: {},
      },
    }],
  },
}
```

This is the simplest way of generating the `bodyHtml` field into the file objects.

### Composable

Add a Nitro plugin to `server/plugins`. We will hook into `content:file:beforeParse` and add our HTML code by calling the composable. Unfortunately, there is currently an [open issue in @nuxt/content](https://github.com/nuxt/content/issues/2056) that does not persist variables added in `content:file:beforeParse`. So we will have to store them and restore them in `content:file:afterParse`. Hopefully this will be fixed soon.

```js
// server/plugins/body-html.js

import { defineNitroPlugin, useNuxtContentBodyHtml } from '#imports'

const nuxtContentBodyHtml = useNuxtContentBodyHtml()

export default defineNitroPlugin(nitroApp => {
  const bodyHtmls = {}

  nitroApp.hooks.hook('content:file:beforeParse', async file =>
    bodyHtmls[file._id] = await nuxtContentBodyHtml.generate(file)
  )
  nitroApp.hooks.hook('content:file:afterParse', file => (file.bodyHtml = bodyHtmls[file._id]))
})
```

### Adding Remark and Rehype plugins

In some cases you will want to add additional plugins to customize the HTML. E.g. in an RSS feed you want to have absolute URLs. You can add plugins to the field configs and the composable like so:

```js
export default {
  modules: [
    '@nuxt/content',
    ['nuxt-content-body-html', {
      fields: {
        bodyHtml: {
          remarkPlugins: {
            'remark-foo': {},
          },
          rehypePlugins: {
            'rehype-foo: {},
          },
        },
      },
    }],
  },
}
```

```js
await useNuxtContentBodyHtml.generate(file, {
  remarkPlugins: {
    'remark-foo': {},
  },
  rehypePlugins: {
    'rehype-foo: {},
  },
})
```

### Enabling the highlighter

You can easily enable syntax highlighting like so:

```js
export default {
  modules: [
    '@nuxt/content',
    ['nuxt-content-body-html', {
      fields: {
        bodyHtml: { highlight: true },
      },
    }],
  },
}
```

```js
await useNuxtContentBodyHtml.generate(file, { highlight: true })
```

## Nuxt 2 and @nuxt/content@^1

`nuxt-content-body-html` works similarly for Nuxt 2 with some minor differences. Firstly, you need to add the module to your `nuxt.config.js` file **before** `@nuxt/content`:

```js
export default {
  modules: [
    'nuxt-content-body-html',
    '@nuxt/content',
  },
}
```

Then, the HTML code will be generated in module context and not in Nitro context, so you can completely configure your fields via the module config and you do not need a composable.

For convenience, if you do not configure any field, a `bodyHtml` field will be configured by default. So the above config will already generate a field.

To add fields or have a different name for the field, you can add fields like so:

```js
export default {
  modules: [
    ['nuxt-content-body-html', {
      fooHtml: {},
    }],
    '@nuxt/content',
  ],
}
```

### Plugins

You can also add plugins to the config. Note that the plugins are arrays:

```js
export default {
  modules: [
    ['nuxt-content-body-html', {
      fooHtml: {
        remarkPlugins: [
          'plugin1',
          ['plugin2', { /* options */ }],
        ],
        rehypePlugins: [
          'plugin1',
          ['plugin2', { /* options */ }],
        ],
      },
    }],
    '@nuxt/content',
  ],
}
```

### Overriding or disabling the highlighter

In `@nuxt/content^1` the highlighter is enabled by default. You can explicitly override or disable the highlighter by setting it in the config:

```js
export default {
  modules: [
    ['nuxt-content-body-html', {
      // Pass a custom highlighter
      highlighter: customHighlighter,

      // Disable the highlighter by setting a noop function
      highlighter: code => `<pre><code class="language-js">${code}</code></pre>`,
    }],
    '@nuxt/content',
  ],
}
```

## Usage for RSS feeds

You can customize the module so that you can use the resulting HTML code for RSS feeds.

Firstly, RSS feeds require URLs to be absolute. You can use [rehype-urls](https://github.com/brechtcs/rehype-urls) to make relative URLs absolute. At the time of writing, the npm version is not compatible with `@nuxt/content@^2`, you will need to fix the issue in [this PR](https://github.com/brechtcs/rehype-urls/pull/3).

```js
// nuxt.config.js

// Set process.env.BASE_URL to the domain to prepend

export default {
  runtimeConfig: {
    baseUrl: process.env.BASE_URL,
  },
  modules: [
    '@nuxt/content',
    'nuxt-content-body-html',
  ],
}
```

```js
// server/plugins/body-html.js

import { defineNitroPlugin, useNuxtContentBodyHtml, useRuntimeConfig } from '#imports'

const { baseUrl } = useRuntimeConfig()
const nuxtContentBodyHtml = useNuxtContentBodyHtml()

export default defineNitroPlugin(nitroApp => {
  const bodyHtmls = {}

  nitroApp.hooks.hook('content:file:beforeParse', async file =>
    bodyHtmls[file._id] = await nuxtContentBodyHtml.generate(file, {
      rehypePlugins: {
        'rehype-urls', { transform: url => (url.host ? url : new URL(url.href, baseUrl)) },
      },
    })
  )
  nitroApp.hooks.hook('content:file:afterParse', file => (file.bodyHtml = bodyHtmls[file._id]))
})
```

<!-- LICENSE/ -->
## Contribute

Are you missing something or want to contribute? Feel free to file an [issue](https://github.com/dword-design/nuxt-content-body-html/issues) or a [pull request](https://github.com/dword-design/nuxt-content-body-html/pulls)! ⚙️

## Support

Hey, I am Sebastian Landwehr, a freelance web developer, and I love developing web apps and open source packages. If you want to support me so that I can keep packages up to date and build more helpful tools, you can donate here:

<p>
  <a href="https://www.buymeacoffee.com/dword">
    <img
      src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
      alt="Buy Me a Coffee"
      width="114"
    >
  </a>&nbsp;If you want to send me a one time donation. The coffee is pretty good 😊.<br/>
  <a href="https://paypal.me/SebastianLandwehr">
    <img
      src="https://sebastianlandwehr.com/images/paypal.svg"
      alt="PayPal"
      width="163"
    >
  </a>&nbsp;Also for one time donations if you like PayPal.<br/>
  <a href="https://www.patreon.com/dworddesign">
    <img
      src="https://sebastianlandwehr.com/images/patreon.svg"
      alt="Patreon"
      width="163"
    >
  </a>&nbsp;Here you can support me regularly, which is great so I can steadily work on projects.
</p>

Thanks a lot for your support! ❤️

## See also

* [nuxt-content-git](https://github.com/dword-design/nuxt-content-git): Adds a property to each @nuxt/content document containing the raw HTML body, rendered from markdown.
* [nuxt-mail](https://github.com/dword-design/nuxt-mail): Adds email sending capability to a Nuxt.js app. Adds a server route, an injected variable, and uses nodemailer to send emails.
* [nuxt-route-meta](https://github.com/dword-design/nuxt-route-meta): Adds Nuxt page data to route meta at build time.
* [nuxt-modernizr](https://github.com/dword-design/nuxt-modernizr): Adds a Modernizr build to your Nuxt.js app.
* [nuxt-mermaid-string](https://github.com/dword-design/nuxt-mermaid-string): Embed a Mermaid diagram in a Nuxt.js app by providing its diagram string.

## License

[MIT License](https://opensource.org/licenses/MIT) © [Sebastian Landwehr](https://sebastianlandwehr.com)
<!-- /LICENSE -->
