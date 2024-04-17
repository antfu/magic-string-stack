import { expect, it } from 'vitest'
import MagicString from 'magic-string'
import MagicStringStack from '../src'

it('should work', () => {
  const s = new MagicString('problems = 99')
  const ss = new MagicStringStack('problems = 99')

  s.update(0, 8, 'answer')
  ss.update(0, 8, 'answer')

  expect(ss.toString()).toMatchInlineSnapshot(`"answer = 99"`)
  expect(ss.original).toMatchInlineSnapshot(`"problems = 99"`)

  ss.commit()

  // After commit, the original string should be updated
  expect(ss.original).toMatchInlineSnapshot(`"answer = 99"`)

  s.update(11, 13, '42')
  ss.update(9, 11, '42') // Because the original string is updated, the positions also change

  expect(ss.toString()).toMatchInlineSnapshot(`"answer = 42"`)

  ss.commit()
  ss.commit() // empty commit
  ss.commit() // empty commit

  s.prepend('var ').append(';')
  ss.prepend('var ').append(';')

  expect(ss.toString()).toMatchInlineSnapshot(`"var answer = 42;"`)

  expect(s.toString()).toEqual(ss.toString())

  const sMap = s.generateMap({ hires: true, includeContent: true })
  const ssMap = ss.generateMap({ hires: true, includeContent: true })

  expect(removeEmptyKeys(sMap))
    .toEqual(removeEmptyKeys(ssMap))
})

it('replace after replace', () => {
  const s = new MagicStringStack('alice bob charlie david edward frank george')

  s.replaceAll('a', 'b')
  s.commit()
  s.replace('blice', 'clice')
  s.commit()
  s.replace(/(^|\s)[a-z]/g, m => m.toUpperCase())

  expect(s.toString())
    .toMatchInlineSnapshot(`"Clice Bob Chbrlie Dbvid Edwbrd Frbnk George"`)

  expect(s.generateMap({ hires: true }))
    .toMatchInlineSnapshot(`
      SourceMap {
        "file": undefined,
        "ignoreList": [],
        "mappings": "AAAA,KAAK,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,CAAC,CAAC",
        "names": [],
        "sourceRoot": undefined,
        "sources": [
          "",
        ],
        "sourcesContent": [
          null,
        ],
        "version": 3,
      }
    `)
})

it('should be sub instance of MagicString', () => {
  const s = new MagicStringStack('')
  expect(s instanceof MagicString).toBe(true)
})

it('should support clone', () => {
  const s = new MagicStringStack('hello world')
  s.update(0, 5, 'goodbye')
  s.commit()
  const s2 = s.clone()
  expect(s.generateMap()).toEqual(s2.generateMap())
  s2.update(8, 13, 'there')
  s2.commit()
  expect(s.toString()).toBe('goodbye world')
  expect(s2.toString()).toBe('goodbye there')
})

it('chainable should return the proxied version', () => {
  const s = new MagicStringStack('hello world')
  const s2 = s.update(0, 5, 'goodbye')
  expect(s2).toBe(s)
})

it('should be chainable', () => {
  const s = new MagicStringStack('hello world')
  s
    .update(0, 5, 'goodbye')
    .commit()
    .update(8, 13, 'there')
    .commit()

  expect(s.toString()).toBe('goodbye there')
  expect(s.generateMap({ hires: 'boundary' }).mappings)
    .toMatchInlineSnapshot(`"AAAA,OAAK,CAAC"`)
})

function removeEmptyKeys(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => !(v == null || (Array.isArray(v) && !v.length))))
}
