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
  // Deno to node doesn't support mapping JSR to NPM for some reason :/
  // mappings: {
  //   ["jsr:@levischuck/tiny-cbor"]: {
  //     name: "@levischuck/tiny-cbor",
  //     version: tinyCborVersion,
  //   },
  // },
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
    // Load package.json from the npm directory
    // and add @levischuck/tiny-cbor to the dependencies
    const packageJson = JSON.parse(Deno.readTextFileSync("npm/package.json"));
    const dependencies = packageJson.dependencies || {};
    packageJson.dependencies = dependencies;
    dependencies["@levischuck/tiny-cbor"] = tinyCborVersion;
    Deno.writeTextFileSync("npm/package.json", JSON.stringify(packageJson, null, 2));
    // Run npm install again
    const proc = new Deno.Command("npm", { args: ['install'], cwd: "npm" }).outputSync();
    if (proc.code !== 0) {
      throw new Error(`Failed to run npm install: ${proc.code}`);
    }
    Deno.removeSync("npm/esm/deps/jsr.io/@levischuck/tiny-cbor", {recursive: true});
    Deno.removeSync("npm/script/deps/jsr.io/@levischuck/tiny-cbor", {recursive: true});
    Deno.removeSync("npm/src/deps/jsr.io/@levischuck/tiny-cbor", {recursive: true});

    // Scan all JS files (recursive) and replace
    // "../deps/jsr.io/@levischuck/tiny-cbor/**/index.js" with "@levischuck/tiny-cbor"
    function listFilesRecursive(dir: string): string[] {
      const files: string[] = [];
      const entries = Deno.readDirSync(dir);

      for (const entry of entries) {
        const fullPath = `${dir}/${entry.name}`;
        if (entry.isDirectory) {
          files.push(...listFilesRecursive(fullPath));
        } else {
          files.push(fullPath);
        }
      }

      return files;
    }

    const esmFiles = listFilesRecursive("npm/esm");
    const scriptFiles = listFilesRecursive("npm/script");
    const srcFiles = listFilesRecursive("npm/src");
    const allFiles = [...esmFiles, ...scriptFiles, ...srcFiles];

    // Filter for JS files and replace imports
    const jsFiles = allFiles.filter(file => file.endsWith('.js') || file.endsWith('.d.ts') || file.endsWith('.ts'));

    for (const file of jsFiles) {
      const content = Deno.readTextFileSync(file);
      const updatedContent = content.replace(
        /(\.\.\/)+deps\/jsr\.io\/@levischuck\/tiny-cbor\/[^\/]+\/index\.js/g,
        '@levischuck/tiny-cbor'
      );
      if (updatedContent !== content) {
        Deno.writeTextFileSync(file, updatedContent);
      }
    }
    // Finally see if any folders in deps are empty and remove them recursively depth first
    function removeEmptyDirsRecursive(dir: string): void {
      try {
        const entries = Deno.readDirSync(dir);
        const entryArray = Array.from(entries);

        // First, recursively process all subdirectories
        for (const entry of entryArray) {
          if (entry.isDirectory) {
            const subDir = `${dir}/${entry.name}`;
            removeEmptyDirsRecursive(subDir);
          }
        }

        // After processing subdirectories, check if current directory is empty
        const updatedEntries = Array.from(Deno.readDirSync(dir));
        if (updatedEntries.length === 0) {
          // Directory is empty, remove it
          Deno.removeSync(dir);
        }
      } catch (_error) {
        // Directory might not exist or we don't have permission, skip it
        return;
      }
    }
    removeEmptyDirsRecursive("npm/esm/deps");
    removeEmptyDirsRecursive("npm/script/deps");
    removeEmptyDirsRecursive("npm/src/deps");

    // Lastly, update all src imports that end in .js to use no extension
    for (const file of srcFiles) {
      if (!file.endsWith('.ts')) {
        continue;
      }
      console.log(`Updating ${file}`);
      const content = Deno.readTextFileSync(file);
      const updatedContent = content.replace(/\.js('|")/g, '.ts$1');
      Deno.writeTextFileSync(file, updatedContent);
    }

  },
});
