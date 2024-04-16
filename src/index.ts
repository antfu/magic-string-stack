import type { DecodedSourceMap, MagicStringOptions, SourceMap, SourceMapOptions } from 'magic-string'
import MagicString from 'magic-string'
import remapping from '@ampproject/remapping'

// Thanks to @sxzz & @starknt for the solution
// eslint-disable-next-line ts/no-unsafe-declaration-merging
export default interface MagicStringStack extends MagicString {}
// eslint-disable-next-line ts/no-unsafe-declaration-merging
export default class MagicStringStack implements MagicString {
  private _stack: MagicString[] = []
  private _current: MagicString

  constructor(
    content: string,
    private _options?: MagicStringOptions,
  ) {
    this._current = new MagicString(content, this._options)
    this._stack.unshift(this._current)

    // We proxy every function to `this._current` so we can swap it out
    return new Proxy(new MagicString(''), {
      get: (_, p, receiver) => {
        if (Reflect.has(this, p))
          return Reflect.get(this, p, receiver)
        let parent = Reflect.get(this._current, p, receiver)
        if (typeof parent === 'function')
          parent = parent.bind(this._current)
        return parent
      },
      set: (_, p, value) => {
        return Reflect.set(this, p, value, this)
      },
    }) as any
  }

  /**
   * Commit current changes and reset the `.original` property and the indices.
   *
   * When running `generateMap`, the sourcemaps will be generated and merged into a single sourcemap.
   */
  commit() {
    const newOne = new MagicString(this._current.toString(), this._options)
    this._current = newOne
    this._stack.unshift(newOne)
  }

  get original() {
    return this._current.original
  }

  toString() {
    return this._current.toString()
  }

  clone() {
    const s = new MagicStringStack(this._current.toString(), this._options)
    s._stack = this._stack.map(s => s.clone())
    s._current = s._stack[0]
    return s
  }

  /**
   * Generates a version 3 sourcemap.
   */
  generateMap(options?: SourceMapOptions): SourceMap {
    const SOURCE_PLACEHOLDER = '__magic_string_placeholder__.js'
    const maps = this._stack.map(s => s.generateMap({ source: SOURCE_PLACEHOLDER, ...options }))
    const merged = remapping(maps as any, () => null) as any
    merged.sources = merged.sources.map((source: string) => source === SOURCE_PLACEHOLDER ? '' : source)
    return merged
  }

  /**
   * Generates a sourcemap object with raw mappings in array form, rather than encoded as a string.
   * Useful if you need to manipulate the sourcemap further, but most of the time you will use `generateMap` instead.
   */
  generateDecodedMap(_options?: SourceMapOptions): DecodedSourceMap {
    throw new Error('Method not implemented.')
  }
}
