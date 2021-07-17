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
        height="32"
      >
    </a><a href="https://www.buymeacoffee.com/dword">
      <img
        src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
        alt="Buy Me a Coffee"
        height="32"
      >
    </a><a href="https://paypal.me/SebastianLandwehr">
      <img
        src="https://sebastianlandwehr.com/images/paypal.svg"
        alt="PayPal"
        height="32"
      >
    </a><a href="https://www.patreon.com/dworddesign">
      <img
        src="https://sebastianlandwehr.com/images/patreon.svg"
        alt="Patreon"
        height="32"
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

## Usage

Add the module to your `nuxt.config.js` file **before** `@nuxt/content`:

```js
export default {
  modules: [
    'nuxt-content-body-html',
    '@nuxt/content',
  },
}
```

This will add a `doc.bodyHtml` property to all documents with the rendered body HTML code.

It is also possible specifiy the name of the property like so:

```js
export default {
  modules: [
    ['nuxt-content-body-html', { fieldName: 'html' }],
    '@nuxt/content',
  ],
}
```

Then you can access it via `doc.html`.

## Adding more remark and rehype plugins

It is possible to add additional plugins via the module config like so:

```js
export default {
  modules: [
    ['nuxt-content-body-html', {
      remarkPlugins: [
        'plugin1',
        ['plugin2', { /* options */ }],
      ],
      rehypePlugins: [
        'plugin1',
        ['plugin2', { /* options */ }],
      ],
    }],
    '@nuxt/content',
  ],
}
```

## Making URLs absolute for RSS feeds

RSS feeds require URLs to be absolute. You can use [rehype-urls](https://github.com/brechtcs/rehype-urls) to make relative URLs absolute like so:

```js
// Set process.env.BASE_URL to the domain to prepend

export default {
  modules: [
    ['nuxt-content-body-html', {
      rehypePlugins: [
        ['rehype-urls', url => (url.host ? url : new URL(url.href, process.env.BASE_URL))],
    }],
    '@nuxt/content',
  ],
}
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
      height="32"
    >
  </a>&nbsp;If you want to send me a one time donation. The coffee is pretty good 😊.<br/>
  <a href="https://paypal.me/SebastianLandwehr">
    <img
      src="https://sebastianlandwehr.com/images/paypal.svg"
      alt="PayPal"
      height="32"
    >
  </a>&nbsp;Also for one time donations if you like PayPal.<br/>
  <a href="https://www.patreon.com/dworddesign">
    <img
      src="https://sebastianlandwehr.com/images/patreon.svg"
      alt="Patreon"
      height="32"
    >
  </a>&nbsp;Here you can support me regularly, which is great so I can steadily work on projects.
</p>

Thanks a lot for your support! ❤️

## See Also

* [nuxt-content-git](https://github.com/dword-design/nuxt-content-git): Adds a property to each @nuxt/content document containing the raw HTML body, rendered from markdown.
* [nuxt-mail](https://github.com/dword-design/nuxt-mail): Adds email sending capability to a Nuxt.js app. Adds a server route, an injected variable, and uses nodemailer to send emails.
* [nuxt-route-meta](https://github.com/dword-design/nuxt-route-meta): Adds Nuxt page data to route meta at build time.
* [nuxt-modernizr](https://github.com/dword-design/nuxt-modernizr): Adds a Modernizr build to your Nuxt.js app.
* [nuxt-mermaid-string](https://github.com/dword-design/nuxt-mermaid-string): Embed a Mermaid diagram in a Nuxt.js app by providing its diagram string.

## License

[MIT License](https://opensource.org/licenses/MIT) © [Sebastian Landwehr](https://sebastianlandwehr.com)
<!-- /LICENSE -->
