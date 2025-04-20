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

Sometimes you need the raw HTML code of `@nuxt/content` documents for processing. A frequent use case is to generate an RSS feed and to add the HTML as `content:encoded`. The module will use the default remark and rehype plugins. You can also add additional plugins.

<!-- INSTALL/ -->
## Install

```bash
# npm
$ npm install nuxt-content-body-html

# Yarn
$ yarn add nuxt-content-body-html
```
<!-- /INSTALL -->

## Usage

Add the module to your `nuxt.config.js` file:

```js
export default {
  modules: [
    '@nuxt/content',
    'nuxt-content-body-html',
  },
}
```

To generate the HTML, you have two options:

1. Add fields to the module config.
2. Use the `useNuxtContentBodyHtml` composable.

If you just need a simple HTML version of your markdown content, the module config is fine. If you want to generate the HTML somewhere else, you can use the composable.

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

Then add the field to your content config:

```js
// content.config.js

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
```

This is the simplest way of generating the `bodyHtml` field into the file objects.

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

### Disabling the highlighter

You can disable syntax highlighting like so:

```js
export default {
  modules: [
    '@nuxt/content',
    ['nuxt-content-body-html', {
      fields: {
        bodyHtml: { highlight: false },
      },
    }],
  },
}
```

### Composable

```js
// server/api/stuff.get.js

const nuxtContentBodyHtml = useNuxtContentBodyHtml();

export default defineEventHandler(event => {
  const file = await queryCollection(event, 'content').first();
  return nuxtContentBodyHtml.generate(file, { /* Same options as field config */ });
});
```

## Usage for RSS feeds

You can customize the module so that you can use the resulting HTML code for RSS feeds.

RSS feeds require URLs to be absolute. You can use [rehype-urls](https://github.com/brechtcs/rehype-urls) to make relative URLs absolute.

```js
// nuxt.config.js

// Set process.env.BASE_URL to the domain to prepend

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    ['nuxt-content-body-html', {
      fields: {
        bodyHtml: {
          rehypePlugins: {
            'rehype-urls': { options: url => (url.host ? url : new URL(url.href, process.env.BASE_URL)) },
          },
        },
      },
    }]
  ]
});
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

[MIT License](https://opensource.org/license/mit/) © [Sebastian Landwehr](https://sebastianlandwehr.com)
<!-- /LICENSE -->
