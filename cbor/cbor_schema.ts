import { decodeCBOR, encodeCBOR } from "jsr:@levischuck/tiny-cbor";
import { array } from "./schema/array.ts";
import { integer } from "./schema/integer.ts";
import { string } from "./schema/string.ts";
import { boolean } from "./schema/boolean.ts";
import { float } from "./schema/float.ts";
import { bytes } from "./schema/bytes.ts";
import { tuple } from "./schema/tuple.ts";
import { union } from "./schema/union.ts";
import { type CBORTypedTag, tagged } from "./schema/tagged.ts";
import { optional } from "./schema/optional.ts";
import { field, map, numberField } from "./schema/map.ts";
import { nested } from "./schema/nested.ts";
import { bigint } from "./schema/bigint.ts";
import { literal } from "./schema/literal.ts";
import type {
  CBORSchemaType,
  CBORSchemaValue,
  FieldDefinition,
} from "./schema/type.ts";
import { lazy } from "./schema/lazy.ts";

/**
 * Infers the TypeScript type from a CBOR schema, an alias of CBORSchemaValue
 *
 * @template T The schema type to infer from
 * @example
 * ```typescript
 *
 * const personSchema = cs.map([
 *   cs.field("name", cs.string),
 *   cs.field("age", cs.integer)
 * ]);
 *
 * type Person = valueOf<typeof personSchema>;
 * // Person = { name: string; age: number }
 * ```
 */
export type valueOf<T> = CBORSchemaValue<T>;

/**
 * Main schema builder class containing all schema constructors and primitive types.
 * Prefer use of the shorthand alias `cs`.
 *
 * @example
 * ```typescript
 * // Using primitive schemas
 * const stringSchema = cs.string;
 * const numberSchema = cs.float;
 *
 * // Creating complex schemas
 * const personSchema = cs.map([
 *   cs.field("name", cs.string),
 *   cs.field("age", cs.integer),
 *   cs.field("hobbies", cs.array(cs.string))
 * ]);
 *
 * // Encoding and decoding
 * const encoded = cs.toCBOR(personSchema, {
 *   name: "Alice",
 *   age: 30,
 *   hobbies: ["reading", "hiking"]
 * });
 * const decoded = cs.fromCBOR(personSchema, encoded);
 * ```
 */
export class CBORSchema {
  static array = array;
  static integer = integer;
  static bigint = bigint;
  static string = string;
  static boolean = boolean;
  static float = float;
  static bytes = bytes;
  static tuple = tuple;
  static union = union;
  static tagged = tagged;
  static optional = optional;
  static map = map;
  static field = field;
  static numberField = numberField;
  static nested = nested;
  static literal = literal;
  static lazy = lazy;
  /**
   * Decodes a CBOR byte array using the provided schema
   *
   * @template T The type to decode to
   * @param schema The schema to use for decoding
   * @param data The CBOR encoded data
   * @returns The decoded value
   *
   * @example
   * ```typescript
   * const data = new Uint8Array([101, 72, 101, 108, 108, 111]);  // "Hello" in CBOR
   * const value = cs.fromCBOR(cs.string, data);
   * ```
   */
  static fromCBOR<T>(
    schema: CBORSchemaType<T>,
    data: Uint8Array | ArrayBuffer | DataView,
  ): T {
    const decoded = decodeCBOR(data);
    return schema.fromCBORType(decoded);
  }

  /**
   * Encodes a value to CBOR using the provided schema
   *
   * @template T The type of the value to encode
   * @param schema The schema to use for encoding
   * @param value The value to encode
   * @returns CBOR encoded data as Uint8Array
   *
   * @example
   * ```typescript
   * const schema = cs.string;
   * const encoded = cs.toCBOR(schema, "Hello, CBOR!");
   * ```
   */
  static toCBOR<T>(schema: CBORSchemaType<T>, value: T): Uint8Array {
    const encoded = schema.toCBORType(value);
    return encodeCBOR(encoded);
  }
}

/**
 * Main schema builder class containing all schema constructors and primitive types.
 * Use this to build complex CBOR schemas that can encode/decode TypeScript types.
 *
 * @example
 * ```typescript
 * // Using primitive schemas
 * const stringSchema = cs.string;
 * const numberSchema = cs.float;
 *
 * // Creating complex schemas
 * const personSchema = cs.map([
 *   cs.field("name", cs.string),
 *   cs.field("age", cs.integer),
 *   cs.field("hobbies", cs.array(cs.string))
 * ]);
 *
 * // Encoding and decoding
 * const encoded = cs.toCBOR(personSchema, {
 *   name: "Alice",
 *   age: 30,
 *   hobbies: ["reading", "hiking"]
 * });
 * const decoded = cs.fromCBOR(personSchema, encoded);
 * ```
 */
export const cs = CBORSchema;

// Export types for external use
export type { CBORTypedTag, FieldDefinition };
