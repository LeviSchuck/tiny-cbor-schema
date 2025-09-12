// ex. scripts/build_npm.ts
import { build, emptyDir } from "../../dnt/mod.ts";

await emptyDir("./npm");

const lockFile = JSON.parse(await Deno.readTextFile("./deno.lock"));

const tinyCborVersion = lockFile.specifiers["jsr:@levischuck/tiny-cbor@*"];
await build({
  entryPoints: ["./index.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  test: false,
  mappings: {
    ["jsr:@levischuck/tiny-cbor"]: {
      name: "@levischuck/tiny-cbor",
      version: tinyCborVersion,
    },
  },
  package: {
    // package.json properties
    name: "@levischuck/tiny-cbor-schema",
    version: Deno.args[0],
    description: "Tiny CBOR Schema library",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/levischuck/tiny-cbor-schema.git",
    },
    bugs: {
      url: "https://github.com/levischuck/tiny-cbor-schema/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE.txt", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
