# Tiny CBOR Schema

[![](https://img.shields.io/github/actions/workflow/status/levischuck/tiny-cbor-schema/build.yaml?branch=main&style=flat-square)](https://github.com/LeviSchuck/tiny-cbor-schema/actions)
[![](https://img.shields.io/codecov/c/gh/levischuck/tiny-cbor-schema?style=flat-square)](https://codecov.io/gh/levischuck/tiny-cbor-schema)
[![](https://img.shields.io/github/v/tag/levischuck/tiny-cbor-schema?label=npm&logo=npm&style=flat-square)](https://www.npmjs.com/package/@levischuck/tiny-cbor-schema)
[![](https://img.shields.io/jsr/v/%40levischuck/tiny-cbor-schema?style=flat-square&logo=jsr&label=JSR)](https://jsr.io/@levischuck/tiny-cbor-schema)
[![](https://img.shields.io/github/license/levischuck/tiny-cbor-schema?style=flat-square)](https://github.com/LeviSchuck/tiny-cbor-schema/blob/main/LICENSE.txt)
![](https://img.shields.io/bundlephobia/min/%40levischuck/tiny-cbor-schema?style=flat-square)

This minimal library decodes and encodes most useful CBOR structures into
prespecified JavaScript structures through a schema at runtime! When used in
TypeScript, parsed outputs will have the types you expect too. _See
[tiny-cbor](https://github.com/levischuck/tiny-cbor), which is automatically
included, for limitations on what CBOR types are supported._ It works in a
similar way to Zod where you define a schema object with functions exported by
this library. With this schema in hand, you can use the `fromCBOR` and `toCBOR` functions to read, update, and write CBOR binary data.

## Installation

You can install the latest version with:

**Node**

```bash
npm i @levischuck/tiny-cbor-schema
```

**Deno**

```bash
deno add jsr:@levischuck/tiny-cbor-schema
```

**Bun**

```bash
bunx jsr add "@levischuck/tiny-cbor-schema"
```

## Example

CBOR decoding example, this outputs a javascript value mapped with the schemo
specified, which is a CBOR sequence / array of string, string, number.

To check that the decoded CBOR matches a schema you expect, or to access it more
naturally in TypeScript and JavaScript, you may do something like the following:

```typescript
// NPM
// import { cs } from "@levischuck/tiny-cbor-schema";
// or JSR
// import { cs } from "jsr:@levischuck/tiny-cbor-schema";
// (Use one of the above imports! The import below makes this documentation testable)
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
  !Array.isArray(doubleChecked) || doubleChecked.length != 3 ||
  doubleChecked[0] !== "hello" || doubleChecked[1] !== "world" ||
  doubleChecked[2] !== 1
) {
  // Is never thrown!
  throw new Error("Did not parse as expected");
}

const encoded = cs.toCBOR(schema, parsed);
if (encoded.length != HELLO_WORLD_BYTES.length) {
  // Is never thrown!
  throw new Error("Length differs");
}
for (let i = 0; i < HELLO_WORLD_BYTES.length; i++) {
  if (encoded[i] !== HELLO_WORLD_BYTES[i]) {
    // Is never thrown!
    throw new Error(`Different byte at ${i}`);
  }
}

console.log("Success");
```

## Where to get it

This library is available on
[NPM](https://www.npmjs.com/package/@levischuck/tiny-cbor-schema) and
[JSR](https://jsr.io/@levischuck/tiny-cbor-schema).
