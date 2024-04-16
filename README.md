# magic-string-stack

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

`magic-string` with the capability of committing changes.

## Usages

```ts
import MagicStringStack from 'magic-string-stack'

const s = new MagicStringStack('problems = 99')

s.replace('problems', 'issues')
  .append('var ')

s.toString() // 'var issues = 99'
s.original // 'problems = 99' (original string)

s.commit() // this will commit the changes

s.original // 'var issues = 99' (applied with previous changes)
s.replace('issues', 'problems')
s.toString() // 'var problems = 99'

s.generateMap() // generate sourcemap, if multiple commits happend, it will generate a combined sourcemap
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2023-PRESENT [Anthony Fu](https://github.com/antfu)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/magic-string-stack?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/magic-string-stack
[npm-downloads-src]: https://img.shields.io/npm/dm/magic-string-stack?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/magic-string-stack
[bundle-src]: https://img.shields.io/bundlephobia/minzip/magic-string-stack?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=magic-string-stack
[license-src]: https://img.shields.io/github/license/antfu/magic-string-stack.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/magic-string-stack/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/magic-string-stack
