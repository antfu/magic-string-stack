/* eslint-disable ts/no-unsafe-declaration-merging */
import type { DecodedSourceMap, MagicStringOptions, SourceMap, SourceMapOptions } from 'magic-string'
import MagicString from 'magic-string'
import remapping from '@ampproject/remapping'

// Thanks to @sxzz & @starknt for the solution
export default interface MagicStringStack extends MagicString {}
export default class MagicStringStack implements MagicString {
  /**
   * The stack of MagicString instances.
   * Lastest instance is pushed to the front of the array.
   */
  private _stack: MagicString[] = []
  /**
   * Prepresents the current MagicString instance.
   * It should be in the this._stack[0]
   */
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
    return this
  }

  /**
   * Rollback to the previous commit.
   */
  rollback() {
    if (this._stack.length <= 1)
      throw new Error('Cannot rollback on the first commit')
    this._stack.shift()
    this._current = this._stack[0]
    return this
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
    if (this._stack.length === 1)
      return this._current.generateMap(options)
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
    throw new Error('generateDecodedMap is not implemented yet. Help us out by contributing to the project if you use this method.')
  }
}
