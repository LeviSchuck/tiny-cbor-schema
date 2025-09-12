# Tiny CBOR Schema

[![](https://img.shields.io/github/actions/workflow/status/levischuck/tiny-cbor-schema/build.yaml?branch=main&style=flat-square)](https://github.com/LeviSchuck/tiny-cbor-schema/actions)
[![](https://img.shields.io/codecov/c/gh/levischuck/tiny-cbor-schema?style=flat-square)](https://codecov.io/gh/levischuck/tiny-cbor-schema)
[![](https://img.shields.io/github/v/tag/levischuck/tiny-cbor-schema?label=npm&logo=npm&style=flat-square)](https://www.npmjs.com/package/@levischuck/tiny-cbor-schema)
[![](https://img.shields.io/jsr/v/%40levischuck/tiny-cbor-schema?style=flat-square&logo=jsr&label=JSR)](https://jsr.io/@levischuck/tiny-cbor-schema)
[![](https://img.shields.io/github/license/levischuck/tiny-cbor-schema?style=flat-square)](https://github.com/LeviSchuck/tiny-cbor-schema/blob/main/LICENSE.txt)
![](https://img.shields.io/bundlephobia/min/%40levischuck/tiny-cbor-schema?style=flat-square)

This minimal generic library decodes and encodes most useful CBOR structures
into known JavaScript structures! See
[tiny-cbor](https://github.com/levischuck/tiny-cbor) for limitations on what
CBOR types are supported.

## Example

CBOR byte decoding example, this outputs a CBORType which is up to you to ensure
matches the right underlying type (e.g. a string) at runtime.

To check that the decoded CBOR matches a schema you expect, or to access it more
naturally in TypeScript and JavaScript:

```typescript
// NPM
// import { cs } from "@levischuck/tiny-cbor-schema";
// or JSR
// import { cs } from "jsr:@levischuck/tiny-cbor-schema";
import { cs } from "./index.ts";

// Utility to demonstrate the type is known at type-check time
type AssertEqual<T, Expected> = T extends Expected ? Expected extends T ? T
  : never
  : never;

const HELLO_WORLD_BYTES = new Uint8Array([
  0x83, // Array (3)
  0x65, // text (5),
  0x68, // h
  0x65, // e
  0x6C, // l
  0x6C, // l
  0x6F, // o
  0x65, // text(5),
  0x77, // w
  0x6F, // o
  0x72, // r
  0x6C, // l
  0x64, // d
  0x01, // 1
]);
const schema = cs.tuple([cs.string, cs.string, cs.integer]);
const parsed = cs.fromCBOR(schema, HELLO_WORLD_BYTES);
// parsed will have the type [string, string, number]
// You don't need to use AssertEqual, this is just for demonstration that the type is preserved
const doubleChecked: AssertEqual<[string, string, number], typeof parsed> =
  parsed;
// If the type failed, this will be `never`, which it should not, since fromCBORType will throw

if (
  Array.isArray(doubleChecked) && doubleChecked.length == 3 &&
  doubleChecked[0] == "hello" && doubleChecked[1] == "world" &&
  doubleChecked[2] == 1
) {
  console.log("Success!");
}
```

## Where to get it

This library is available on
[NPM](https://www.npmjs.com/package/@levischuck/tiny-cbor-schema) and
[JSR](https://jsr.io/@levischuck/tiny-cbor-schema).
