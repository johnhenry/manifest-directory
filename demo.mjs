import { join } from "node:path";
import theresWaldo from "theres-waldo";
import manifestDirectory, { directoryManifested } from "./index.mjs";
const { dir } = theresWaldo(import.meta.url);
const result = await manifestDirectory(join(dir, "test-directory"));
console.log(result);
await directoryManifested(join(dir, "directory-test"), result);

await directoryManifested(join(dir, "directory-test"), {
  "readme.md": "# hello\n",
});
