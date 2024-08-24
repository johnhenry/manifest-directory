import { join } from "node:path";
import theresWaldo from "theres-waldo";
import { manifestDirectory } from "./index.mjs";
const { dir } = theresWaldo(import.meta.url);
console.log(await manifestDirectory(join(dir, "test-directory")));
